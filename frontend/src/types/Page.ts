import Profile from './Profile'

export default interface Page {
  id: string
  createdAt: string
  name: string
  profile: Profile
  content: string
  font: string
  page: number
  partOfStory: string
  continuedFrom: string | null
}
