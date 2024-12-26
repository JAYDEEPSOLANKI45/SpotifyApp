module.exports.wrapAsync=function(func)
{
    return function(req,res,next)
    {
        func(req,res,next).catch(next);
    }
};