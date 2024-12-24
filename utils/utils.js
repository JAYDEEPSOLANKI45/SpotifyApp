class ExpressError extends Error
{
    constructor(status,message)
    {
        super();
        this.status=status;
        this.message=message;
    }
}

module.exports=ExpressError;

module.exports.wrapAsync=function(func)
{
    return function(req,res,next)
    {
        func(req,res,next).catch(next);
    }
};