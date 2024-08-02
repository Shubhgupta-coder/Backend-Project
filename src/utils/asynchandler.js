// it is a function which act like a wrapper when we connect with database or request omthing from database

// Using promise method
// here instead f try catch we directly use Promise resolve 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }
// its a higher order funncn    

// const asyncHandler = () => {}
    // it contain functon as a para meter and it contains another function in it
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler=(fn)=> async(req,res,next)=>{
//     try {
//            await fn(req,res,next)
//     } catch (error) {
//         // if we get error code then err.code else 500
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }