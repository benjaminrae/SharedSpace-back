const paths = {
  partialPaths: {
    usersPath: "/users",
    loginPath: "/login",
    registerPath: "/register",
  },

  get usersLoginPath() {
    return `${this.partialPaths.usersPath}${this.partialPaths.loginPath}`;
  },

  get usersRegisterPath() {
    return `${this.partialPaths.usersPath}${this.partialPaths.registerPath}`;
  },
};

export default paths;
