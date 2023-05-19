export function benchLog(context: string, timeTaken: number, info: string) {
  const timeTakenS = (timeTaken / 1000).toFixed(2);
  console.info(
    `{"message":"${context} ${timeTakenS}s - ${info}","time":${timeTaken}, "context":"${context}"}`,
  );
}
