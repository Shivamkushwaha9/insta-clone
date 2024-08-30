import jwt from "jsonwebtoken";

const isAuthenticated = async (req,res,next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:"The user is not authenticated",
                success:false
            });
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:"The token is Invalid",
                success:false
            })
        }

        //This(userId) is coming from the login controller where we created a token which contained the unique identifier as userId and this is where we are getting this thing from :) hope that makes sense.

        //Also think of req.id as variable name cuz we are gonna use it on the editProfile controller
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error)
    }
}

export default isAuthenticated;