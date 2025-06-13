export const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Acceso denegado: solo admin puede realizar esta accion' });
    }
    next();
  };
  