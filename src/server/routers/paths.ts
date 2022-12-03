const paths = {
  partialPaths: {
    usersPath: "/users",
    loginPath: "/login",
    registerPath: "/register",
    locationsPath: "/locations",
    addPath: "/add",
    myLocationsPath: "/my-locations",
    deleteLocationPath: "/delete-location/:locationId",
    locationByIdPath: "/location/:locationId",
    locationPath: "/location",
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

  get getMyLocationsPath() {
    return `${this.partialPaths.locationsPath}${this.partialPaths.myLocationsPath}`;
  },

  get deleteLocationPath() {
    return `${this.partialPaths.locationsPath}/delete-location`;
  },

  get getLocationByIdPath() {
    return `${this.partialPaths.locationsPath}${this.partialPaths.locationPath}`;
  },
};

export default paths;
