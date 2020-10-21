export interface ITargets {
  microservice_name: string,
  microservice_directory: string,
  potition_name: string,
  file_type_name: string,
  processing_time_interval: number
}

export interface ITargetsDir {
  path: string,
  sweep_minutes: number,
  is_subdirectory: number
}