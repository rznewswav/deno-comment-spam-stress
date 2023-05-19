export function benchLog(context: string, timeTaken: string, info: string) {
    console.info(`{"message":"${context} ${timeTaken}s - ${info}","context":"${context}"}`)
}