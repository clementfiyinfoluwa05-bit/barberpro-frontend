// localStorage can throw when a browser blocks site storage; never let that crash the app.
export const readJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

export const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: the user stays logged in for this visit only
  }
};

export const remove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
