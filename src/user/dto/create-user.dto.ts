export class CreateUserDto {
  phone: string;
  email: string;
  nickname: string;
  location?: string;
  gender: 'Male' | 'Female' | 'Other';
  avatar?: string;
  password: string;
}
