// Production level code for handling response
// here we write khud ki Apiresponse class

class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 //[usually success code] 
    }
}

export { ApiResponse }


