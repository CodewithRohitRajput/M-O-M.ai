import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const sessionToken = req.cookies?.google_session;

  if (!sessionToken) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }



  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: 'JWT_SECRET is not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(sessionToken, secret) as {userId : string, accessToken: string};
    if(!decoded.accessToken){
      res.status(401).json({
        success: false,
        message: "Google access token is not present"
      })
      return 
    }
    
    
    res.locals.userId = decoded.userId    
    res.locals.googleAccessToken = decoded.accessToken    

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    return;
  }
};

export default authenticateToken;
