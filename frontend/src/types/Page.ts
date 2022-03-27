import Profile from './Profile'

export default interface Page {
  id: string
  createdAt: string
  name: string
  profile: any
  content: string
  font: string
  page: number
  partOfStory: string
  continuedFrom: string | null
  mainPost: string | null
}
