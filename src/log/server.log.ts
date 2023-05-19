export function serverLog(method: string, timeTaken: number, path: string, statusCode: number) {
    const timeTakenS = (timeTaken / 1000).toFixed(2)
    console.log(`{"message": "${timeTakenS} ${statusCode} ${method} ${path}", "time": ${timeTaken}, "method":"${method}","path":"${path}","status":${statusCode}}`)
}