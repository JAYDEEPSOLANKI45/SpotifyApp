module.exports.existsAccessToken=function(req,res,next)
{
    if(req.session.accessToken)
    {
        console.log("exists");
        return res.redirect(req.originalUrl);
    }
    next();
};

module.exports.isLogined=function(req,res,next)
{
    if(!req.session.accessToken)
    {
        req.session.redirectUrl=req.originalUrl || "/home";
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl=function(req,res,next)
{
    res.locals.redirectUrl=req.session.redirectUrl;
    next();
}