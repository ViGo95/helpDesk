function success(req, res, status, log, message, request) {
    console.log(log)

    res.header({
        message: message
    })

    res.status(status || 200).send(request)
}

function error(req, res, status, error, message, request) {
    console.log(error)

    res.header({
        message: message
    })

    res.status(status || 500).send(request)
}

module.exports = {
    success,
    error,
}