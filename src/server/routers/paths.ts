const paths = {
  partialPaths: {
    usersPath: "/users",
    loginPath: "/login",
    registerPath: "/register",
    locationsPath: "/locations",
    addPath: "/add",
  },

  get usersLoginPath() {
    return `${this.partialPaths.usersPath}${this.partialPaths.loginPath}`;
  },

  get usersRegisterPath() {
    return `${this.partialPaths.usersPath}${this.partialPaths.registerPath}`;
  },

  get locationsAddPath() {
    return `${this.partialPaths.locationsPath}${this.partialPaths.addPath}`;
  },
};

export default paths;
