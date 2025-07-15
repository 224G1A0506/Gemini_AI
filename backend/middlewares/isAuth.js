import jwt from 'jsonwebtoken';
const isAuth =async (req, res, next) => {
  try{
    const token=req.cookies.token;
    if(!token){
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const verifyToken =await jwt.verify(token, process.env.JWT_SECRET);
    req.userId=verifyToken.userId;
    next();
  }catch(err){
    return res.status(500).json({ message: 'Authentication failed' });
  }
};
export default isAuth