
const allowedTransitions = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['closed', 'in_progress'],
  closed: [],
  cancelled: []
};

export function isTerminalStatus(status) {
  return status === 'closed' || status === 'cancelled';
}


export function isValidTransition(currentStatus, newStatus) {
  
  if (currentStatus === newStatus) return true;
  
  const validNextStates = allowedTransitions[currentStatus];
  
  
  if (!validNextStates) return false;
  return validNextStates.includes(newStatus);
}


export function isValidStatus(status) {
  return Object.keys(allowedTransitions).includes(status);
}