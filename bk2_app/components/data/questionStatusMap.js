// Backend -> Frontend
// The Question model only has 3 states (no admin-review stage — the
// astrologer's "Send" click delivers straight to the client), so
// "answered" maps onto the existing "delivered" pill, which is already
// styled as a terminal/success state.
export const QUESTION_STATUS_FROM_BACKEND = {
  pending: "new",
  processing: "progress",
  answered: "delivered",
};

// Frontend -> Backend
// Only pending/processing are settable via PATCH /astrologer/questions/:id/status
// — "answered" is only reachable by actually sending the answer.
export const QUESTION_STATUS_TO_BACKEND = {
  new: "pending",
  progress: "processing",
};