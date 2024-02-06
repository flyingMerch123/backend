
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/api/v1/auth/registration": {
        "post": {
          "operationId": "registration",
          "summary": "Registration in the system. Email with confirmation code will be send to passed email address",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationUserModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the inputModel has incorrect values (in particular if the user with the given email or login already exists)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/registration-confirmation": {
        "get": {
          "operationId": "confirmRegistration",
          "summary": "Confirm Registration",
          "description": "This endpoint is used to confirm email ownership and automatically redirect the user to the login page.",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Code that be sent via Email inside link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "204": {
              "description": "Email was verified. Account was activated"
            },
            "400": {
              "description": "If the confirmation code is incorrect, expired or already been applied",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/resend-code": {
        "post": {
          "operationId": "resendCode",
          "summary": "Resend confirmation registration Email if user exists",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Code that will be emailed inside the link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Input data is accepted.Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the confirmation code is incorrect, expired or already been applied",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/password-recovery": {
        "post": {
          "operationId": "passwordRecovery",
          "summary": "Password recovery via Email confirmation. Email should be sent with RecoveryCode inside",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PasswordRecoveryModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Even if current email is not registered (for prevent user's email detection)"
            },
            "400": {
              "description": "If the inputModel has invalid email (for example 222^gmail.com)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/confirm-password-recovery": {
        "get": {
          "operationId": "confirmPasswordRecovery",
          "summary": "Confirm recovery password",
          "description": "This endpoint is used to confirm email ownership and automatically redirect the user to input new password page.",
          "parameters": [
            {
              "name": "code",
              "required": true,
              "in": "query",
              "description": "Recovery code that be sent via Email inside link",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            },
            "204": {
              "description": "Email was verified."
            },
            "400": {
              "description": "If the recovery code is incorrect, expired or already been used",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/new-password": {
        "post": {
          "operationId": "confirmRecoveryPassword",
          "summary": "New password",
          "description": "This endpoint is used to set a new password",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePasswordModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "If code is valid and new password is accepted"
            },
            "400": {
              "description": "If the inputModel has incorrect values(recovery code is incorrect, expired or not confirmed or password incorrect)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/login": {
        "post": {
          "operationId": "login",
          "summary": "Try login user to the system",
          "parameters": [
            {
              "name": "user-agent",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "origin",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginModel"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string",
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the password or login is wrong"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/refresh-token": {
        "post": {
          "operationId": "refreshSession",
          "summary": "Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)",
          "parameters": [
            {
              "name": "origin",
              "required": true,
              "in": "header",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns new pair: JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 200 minutes).",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "string",
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the refreshToken has incorrect or expired",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/auth/me": {
        "get": {
          "operationId": "me",
          "summary": "Get information about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ViewUserModel"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/auth/logout": {
        "post": {
          "operationId": "logout",
          "summary": "In cookie client must send correct refreshToken that will be revoked",
          "parameters": [],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/api/v1/profile": {
        "get": {
          "operationId": "getMyProfile",
          "summary": "Get my profile",
          "description": "This endpoint is used to getting my profile.",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ViewProfileModel"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Profile"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "put": {
          "operationId": "updateProfile",
          "summary": "Update my profile",
          "description": "This endpoint is used to updating my profile.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateProfileModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Profile have updated"
            },
            "401": {
              "description": "Unauthorized"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Profile"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/public/profile/{userName}": {
        "get": {
          "operationId": "getPublicProfile",
          "summary": "Get public profile",
          "description": "This endpoint is used to getting public profile by link",
          "parameters": [
            {
              "name": "userName",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "currentPage",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 8,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PublicViewProfileModel"
                  }
                }
              }
            },
            "404": {
              "description": "Profile not found"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Public"
          ]
        }
      },
      "/api/v1/avatar": {
        "get": {
          "operationId": "getAvatar",
          "summary": "Get avatar",
          "parameters": [],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Avatar"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "deleteAvatar",
          "summary": "Delete avatar",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            }
          },
          "tags": [
            "Avatar"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/avatar/upload": {
        "put": {
          "operationId": "uploadAvatar",
          "summary": "Upload avatar",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Avatar Img",
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "avatar": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Img is accepted."
            }
          },
          "tags": [
            "Avatar"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/post": {
        "get": {
          "operationId": "getMyPosts",
          "summary": "Get my posts",
          "description": "This endpoint is used to getting my posts.",
          "parameters": [
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "currentPage",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 8,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PaginationViewModel"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Post"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "post": {
          "operationId": "uploadPostImages",
          "summary": "Upload post images",
          "description": "This endpoint is used to upload post images.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "$ref": "#/components/schemas/UploadImagesModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ViewPostModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Post"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/post/{id}": {
        "put": {
          "operationId": "updatePost",
          "summary": "Update post",
          "description": "This endpoint is used to update exists post.",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateDescriptionModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Post have updated"
            },
            "400": {
              "description": "If the inputModel has incorrect values.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "It is not your post"
            },
            "404": {
              "description": "Post not found"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Post"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "deletePost",
          "summary": "Delete post",
          "description": "This endpoint is used to delete exists post.",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "Post have deleted"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "It is not your post"
            },
            "404": {
              "description": "Post not found"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Post"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/api/v1/public/posts": {
        "get": {
          "operationId": "getPublicPosts",
          "summary": "Get public posts",
          "description": "This endpoint is used to viewing public posts on the main page",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PublicViewMainPageModel"
                  }
                }
              }
            }
          },
          "tags": [
            "Public"
          ]
        }
      },
      "/api/v1/public/posts/{id}": {
        "get": {
          "operationId": "getPublicPost",
          "summary": "Get public post by id",
          "description": "This endpoint is used to viewing public post by the link",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PublicViewPostModel"
                  }
                }
              }
            },
            "404": {
              "description": "Post not found"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Public"
          ]
        }
      }
    },
    "info": {
      "title": "Inctagram(Flying Merch)",
      "description": "",
      "version": "1.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "Auth",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "RegistrationUserModel": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string",
              "minimum": 6,
              "maximum": 30,
              "pattern": "^[a-zA-Z0-9_-]*$"
            },
            "email": {
              "type": "string",
              "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n"
            },
            "password": {
              "type": "string",
              "minimum": 6,
              "maximum": 20,
              "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\\-.:;<=>?@[\\\\\\]^_`{|}~]).*$"
            }
          },
          "required": [
            "login",
            "email",
            "password"
          ]
        },
        "PasswordRecoveryModel": {
          "type": "object",
          "properties": {}
        },
        "UpdatePasswordModel": {
          "type": "object",
          "properties": {
            "newPassword": {
              "type": "string",
              "minimum": 6,
              "maximum": 20,
              "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\\-.:;<=>?@[\\\\\\]^_`{|}~]).*$"
            },
            "recoveryCode": {
              "type": "string"
            }
          },
          "required": [
            "newPassword",
            "recoveryCode"
          ]
        },
        "LoginModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          },
          "required": [
            "email",
            "password"
          ]
        },
        "ViewUserModel": {
          "type": "object",
          "properties": {
            "login": {
              "type": "string"
            },
            "email": {
              "type": "string"
            },
            "userId": {
              "type": "number"
            }
          },
          "required": [
            "login",
            "email",
            "userId"
          ]
        },
        "ViewProfileModel": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string"
            },
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "dateOfBirth": {
              "type": "string"
            },
            "city": {
              "type": "string"
            },
            "country": {
              "type": "string"
            },
            "aboutMe": {
              "type": "string"
            },
            "avatarUrl": {
              "type": "string"
            }
          },
          "required": [
            "userName",
            "firstName",
            "lastName",
            "dateOfBirth",
            "city",
            "country",
            "aboutMe",
            "avatarUrl"
          ]
        },
        "UpdateProfileModel": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string",
              "minimum": 6,
              "maximum": 30,
              "pattern": "^[a-zA-Z0-9_-]*$"
            },
            "firstName": {
              "type": "string",
              "minimum": 1,
              "maximum": 50
            },
            "lastName": {
              "type": "string",
              "minimum": 1,
              "maximum": 50
            },
            "dateOfBirth": {
              "type": "string"
            },
            "city": {
              "type": "string",
              "minimum": 0,
              "maximum": 50
            },
            "country": {
              "type": "string",
              "minimum": 0,
              "maximum": 50
            },
            "aboutMe": {
              "type": "string",
              "minimum": 0,
              "maximum": 200
            }
          },
          "required": [
            "userName",
            "firstName",
            "lastName",
            "dateOfBirth",
            "city",
            "country",
            "aboutMe"
          ]
        },
        "ViewPostModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "createdAt": {
              "type": "string"
            },
            "imageUrl": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "id",
            "description",
            "createdAt",
            "imageUrl"
          ]
        },
        "PaginationViewModel": {
          "type": "object",
          "properties": {
            "pagesCount": {
              "type": "number"
            },
            "currentPage": {
              "type": "number"
            },
            "pageSize": {
              "type": "number"
            },
            "itemsCount": {
              "type": "number"
            },
            "items": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/ViewPostModel"
              }
            }
          },
          "required": [
            "pagesCount",
            "currentPage",
            "pageSize",
            "itemsCount",
            "items"
          ]
        },
        "PublicViewProfileModel": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string"
            },
            "following": {
              "type": "number"
            },
            "followers": {
              "type": "number"
            },
            "postsCount": {
              "type": "number"
            },
            "aboutMe": {
              "type": "string"
            },
            "posts": {
              "$ref": "#/components/schemas/PaginationViewModel"
            }
          },
          "required": [
            "userName",
            "following",
            "followers",
            "postsCount",
            "aboutMe",
            "posts"
          ]
        },
        "UploadImagesModel": {
          "type": "object",
          "properties": {
            "images": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "binary"
              },
              "description": "Array of uploaded images (PNG or JPEG format, maximum 10 images allowed, maximum size: 20MB each)"
            }
          },
          "required": [
            "images"
          ]
        },
        "CreateDescriptionModel": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "minimum": 0,
              "maximum": 500
            }
          }
        },
        "PublicViewPostModel": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string"
            },
            "imageUrl": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "description": {
              "type": "string"
            },
            "comments": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "userName",
            "imageUrl",
            "description",
            "comments"
          ]
        },
        "PublicViewMainPageModel": {
          "type": "object",
          "properties": {
            "usersCount": {
              "type": "number"
            },
            "lastPosts": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/PublicViewPostModel"
              }
            }
          },
          "required": [
            "usersCount",
            "lastPosts"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
