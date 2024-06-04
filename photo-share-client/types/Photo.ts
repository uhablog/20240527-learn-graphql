import { User } from "./User"

export type Photo = {
  id: string
  name: string
  url: string
  description: string
  postedBy: User
}