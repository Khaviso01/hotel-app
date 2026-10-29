// Central application state is implemented in AppContext.
// Re-export the provider and hook to keep state access consistent.
export { AppProvider, useApp } from "./context/AppContext";
