const paths = {
  partialPaths: {
    usersPath: "/users",
    loginPath: "/login",
  },

  get usersLoginPath() {
    return `${this.partialPaths.usersPath}${this.partialPaths.loginPath}`;
  },
};

export default paths;
