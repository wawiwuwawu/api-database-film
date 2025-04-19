# Database film API Documentation

API ini digunakan sebagai Back-End aplikasi database film yang menjadi project pada matakulian pemrograman mobile

Base URL():
- https://api.wawunime.my.id

## Autentikasi pada login

### POST /api/auth/register

Digunakan sebagai endpoint untuk mendaftarkan pengguna baru.

### Payload
- **Role : customer.**

```json
{
    "nama": "string",
    "email": "string",
    "password": "string"
}
```

### Response
- **Role: customer**
   
   201: Created
   ```json
    {
       "message": "Email already exists!"
       "token" : "string"
   }
   ```
   400: Bad Request
   ```json
   {
       "massage": "Email already exists!"
   }
   ```
   
   400: Bad Request
   ```json
   {
    "errors": [
        {
            "type": "field",
            "msg": "Name is required",
            "path": "name",
            "location": "body"
        },
        {
            "type": "field",
            "msg": "Email is required",
            "path": "email",
            "location": "body"
        },
        {
            "type": "field",
            "msg": "Password is required",
            "path": "password",
            "location": "body"
        }
    ]
   }
   ```

  400: Bad Request
  ```json
  {
    "errors": [
        {
            "type": "field",
            "value": "Dedeari@.com",
            "msg": "Invalid email format",
            "path": "email",
            "location": "body"
        }
    ]
  }
  ```



  400: Bad Request
  ```json
  {
      "errors": [
          {
              "type": "field",
              "value": "1318",
              "msg": "Password must be at least 6 characters",
              "path": "password",
              "location": "body"
          }
      ]
  }
  ```

  ### POST /api/auth/login

  Digunakan sebagai endpoint untuk verifikasi akun pada saat login ke dalam aplikasi.

  **payload**

    Role "customer"

  ```
  {
      "email": "string",
      "password": "string"
  }
  ```

  ###Response

  200: OK
  ```json
  {
      "email": "string"
      "token": "string"
  }
  ```

  400: Bad Request
  ```json
  {
      "errors": [
          {
              "type": "field",
              "value": "",
              "msg": "Invalid email format",
              "path": "email",
              "location": "body"
          }
          {
              "type": "field",
              "value": "",
              "msg": "Password is required",
              "path": "password",
              "location": "body"
          }
      ]
  }
  ```


  401: Unauthorized
  ```json
  {
      "message": "Invalid credentials"
  }
  ```

  ### Response lainnya

  500: Server error
  ```json
  {
      "message": "Internal server error"
  }
  ```
