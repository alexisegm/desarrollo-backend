// TODO: coordination layer. It applies process rules, validates transitions
// and defines units of work. NO SQL and NO HTTP status codes here: throw
// typed errors and let the routes translate them.
//
// Suggested shape (matches persistence-contract.md):
//
//   listRequests(filters)  -> representations[]      (validate filter values -> contract error)
//   getRequest(id)         -> representation         (missing -> resource error)
//   createRequest(input)   -> representation
//       - title required, priority validated, defaults applied
//       - UNIT OF WORK: insert request + insert birth history (NULL -> open)
//   patchRequest(id, body) -> representation
//       - collect updatable fields; shape validation -> contract errors
//       - UNIT OF WORK: read current + validate transition/terminal
//         (domain errors) + update + insert history, all with ONE client
//   getHistory(id)         -> history representations[] (missing request -> resource error)
//
// The AppError class below is ready: category decides the HTTP translation
// ('contract' -> 400, 'resource' -> 404, 'domain' -> 409).



// TODO: implement the five operations. Start with listRequests and
// getRequest (read-only), then createRequest, then patchRequest.
import { withTransaction } from '../../database/transaction.js';
import { addRequest, insertStatusHistory, findRequestById, updateRequest, findHistory } from './requests.store.js';
import { isTerminal, canTransition } from './request-status.js';

export class AppError extends Error {
  constructor(category, code, message) {
    super(message);
    this.category = category;
    this.code = code;
  }
}

const PRIORITIES = ['low', 'medium', 'high'];

export async function createRequest(input) {
  const { title, description, priority } = input;

  
  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('contract', 'TITLE_REQUIRED', 'A request needs a non-empty title.');
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    throw new AppError('contract', 'INVALID_PRIORITY', `Unknown priority "${priority}". Valid values: ${PRIORITIES.join(', ')}.`);
  }

  
  const request = await withTransaction(async (client) => {
    
    const newRequest = await addRequest({
      title: title.trim(),
      description: typeof description === 'string' ? description : '',
      priority: priority ?? 'medium'
    }, client);

     
    await insertStatusHistory(newRequest.id, null, 'open', client);

    return newRequest;
  });

  return request;
}

export async function patchRequest(id, changes) {
 
  return await withTransaction(async (client) => {
    
    const current = await findRequestById(id, client);

    if (!current) {
      throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
    }

    
    if (isTerminal(current.status)) {
      throw new AppError('domain', 'REQUEST_IN_TERMINAL_STATUS', `Request ${id} is ${current.status} and can no longer be modified.`);
    }

    if (changes.status !== undefined && changes.status !== current.status) {
      if (!canTransition(current.status, changes.status)) {
        throw new AppError('domain', 'INVALID_STATUS_TRANSITION', `A request cannot move from ${current.status} to ${changes.status}.`);
      }
    }

    
    const updated = await updateRequest(id, changes, client);

    
    if (changes.status !== undefined && changes.status !== current.status) {
      await insertStatusHistory(id, current.status, changes.status, client);
      
    }

    return updated;
  });
}

export async function getHistory(id) {

  const current = await findRequestById(id);
  if (!current) {
    throw new AppError('resource', 'REQUEST_NOT_FOUND', `Request ${id} does not exist.`);
  }

  
  return await findHistory(id);
}