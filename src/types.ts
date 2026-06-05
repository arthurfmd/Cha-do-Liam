export interface Gift {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  status: 'available' | 'chosen';
  chosenBy: string;
  public: boolean;
  createdAt: number;
}

export interface EventInfo {
  date: string;
  location: string;
  title?: string;
  description?: string;
}
