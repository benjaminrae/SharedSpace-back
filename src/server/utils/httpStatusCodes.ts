const httpStatusCodes = {
  successCodes: {
    okCode: 200,
  },

  clientErrors: {
    badRequestCode: 400,
    unauthorizedCode: 401,
    forbiddenCode: 403,
    notFoundErrorCode: 404,
    conflictsErrorCode: 409,
  },

  serverErrors: {
    internalServerErrorCode: 500,
  },
};

export default httpStatusCodes;
