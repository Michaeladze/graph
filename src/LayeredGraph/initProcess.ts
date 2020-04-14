/** Дополняем процесс стартовым и конечным узлами
 * @param process - процесс без [start], [end] */
export const initProcess = (process: number[]): number[] => {
  return [0, ...process, 1];
}
