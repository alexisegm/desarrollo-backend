// ============================================================================
// STARTER NOTE — Stations 2, 3 and 4 live here.
//
// Contracts to honor (see docs/http-contract.md and your auth-contract.md):
//
//   register(body) -> { id, email, role: 'requester', createdAt }
//     * allowlist: only email and password may arrive. Any server-controlled
//       field present in the body (role, id, createdAt, updatedAt, createdBy,
//       passwordHash) -> AppError('contract', 'SERVER_CONTROLLED_FIELD', ...).
//       Reject explicitly — never ignore silently.
//     * email: required, basic format, normalize (trim + lowercase) BEFORE
//       storing -> AppError('contract', 'INVALID_EMAIL', ...) otherwise.
//     * password: string of 15..128 characters (Unicode and spaces allowed,
//       no arbitrary composition rules) -> AppError('contract',
//       'INVALID_PASSWORD', ...) otherwise. NEVER log it.
//     * duplicate email -> AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED',
//       'The account cannot be created with the supplied information.')
//       — generic on purpose: do not confirm that the email exists.
//       (pg raises error.code '23505' on a unique violation.)
//     * store ONLY the hash produced by hashPassword — never the password.
//
//   login(body) -> { accessToken, tokenType: 'Bearer', expiresIn: <seconds> }
//     * EVERY failure (unknown email, wrong password, anything else) answers
//       the SAME AppError('auth', 'INVALID_CREDENTIALS',
//       'Email or password is incorrect.') — identical bytes, no clues.
//     * verify with verifyPassword against the stored hash.
//
//   getCurrentUser(actor) -> { id, email, role }
//     * actor comes from req.auth (station 5). Never return password
//       material of any kind.
// ============================================================================
import { AppError } from '../../app-error.js';
import {
  hashPassword,
  verifyPassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from './password.js';
import { issueToken, TOKEN_TTL_SECONDS } from './token.js';
import { findByEmail, findById, insertUser } from '../users/users.store.js';
import { mapUserRow } from '../users/user.mapper.js';

export async function register(body) {
  // TODO (station 2): validate the allowlist, normalize the email, validate
  // the password, hash it (station 3) and persist through users.store.
  const SERVER_CONTROLLED_FIELDS = ['role', 'id', 'createdAt', 'updatedAt', 'createdBy', 'passwordHash'];
  
  for (const field of SERVER_CONTROLLED_FIELDS) {
    if (field in body) {
      throw new AppError('contract', 'SERVER_CONTROLLED_FIELD', `El campo ${field} no puede ser enviado por el cliente.`);
    }
  }

  let { email, password } = body;

  if (!email || typeof email !== 'string') {
    throw new AppError('contract', 'INVALID_EMAIL', 'El correo es requerido y debe ser texto');
  }
  email = email.trim().toLowerCase();

  if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw new AppError('contract', 'INVALID_PASSWORD', 'La contraseña debe tener entre 15 y 128 caracteres');
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new AppError('domain', 'ACCOUNT_CANNOT_BE_CREATED', 'No se pudo crear la cuenta.');
  }

  const hashedPassword = await hashPassword(password);


  const newUserRow = await insertUser({ 
    email, 
    passwordHash: hashedPassword
  });

  return mapUserRow(newUserRow);
}

export async function login(body) {
  // TODO (station 4): find the user, verify the password, and issue a token.
  // One generic failure for every cause.
  const { email, password } = body;
  const userRow = await findByEmail(email);

  if (!userRow) {
    throw new AppError('auth', 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }

  const isValid = await verifyPassword(password, userRow.password_hash);
  
  if (!isValid) {
    throw new AppError('auth', 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  }
  const user = mapUserRow(userRow);

  const accessToken = await issueToken(user);

  return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: TOKEN_TTL_SECONDS
  };
}

export async function getCurrentUser(actor) {
  // TODO (station 5): load the user behind actor.userId and answer only
  // id, email and role.
  throw new Error('TODO: getCurrentUser is not implemented yet.');
}