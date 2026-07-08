export type EmployeeItem = {
  address: string;
  accentColor: string;
  avatarUrl: string;
  bio: string;
  dob: string;
  email: string;
  employeeCode: string;
  id: string;
  name: string;
  phone: string;
  role: string;
  startDate: string;
  status: 'active' | 'inactive';
};

const employeeRoles = [
  {
    role: 'Salon Manager',
    bio: 'Keeps the team aligned, manages schedules, and supports daily operations.',
  },
  {
    role: 'Nail Technician',
    bio: 'Specializes in detailed gel sets, acrylic care, and trending nail art.',
  },
  {
    role: 'Receptionist',
    bio: 'Welcomes guests, confirms bookings, and keeps customer care running smoothly.',
  },
  {
    role: 'Hair Stylist',
    bio: 'Handles cuts, color consultations, and polished styling for regular clients.',
  },
  {
    role: 'Spa Therapist',
    bio: 'Provides body-care treatments and helps guests relax between busy appointments.',
  },
  {
    role: 'Cashier',
    bio: 'Closes payments accurately, manages invoices, and supports front-desk flow.',
  },
] as const;

const firstNames = [
  'David',
  'Emily',
  'Sarah',
  'Linh',
  'Minh',
  'Anna',
  'Jason',
  'Thao',
  'Kevin',
  'Mai',
] as const;

const lastNames = [
  'Nguyen',
  'Tran',
  'Le',
  'Pham',
  'Hoang',
  'Vo',
  'Bui',
  'Do',
  'Huynh',
  'Dang',
] as const;

const accentPalette = [
  '#4F8EF7',
  '#2BB0A5',
  '#F57C00',
  '#E15D97',
  '#6C63FF',
  '#47A447',
  '#D94A38',
  '#16A0D6',
  '#9B59B6',
  '#F2A93B',
] as const;

const avatarUrls = [
  'https://i.pravatar.cc/160?img=12',
  'https://i.pravatar.cc/160?img=32',
  'https://i.pravatar.cc/160?img=47',
  'https://i.pravatar.cc/160?img=21',
  'https://i.pravatar.cc/160?img=56',
  'https://i.pravatar.cc/160?img=36',
  'https://i.pravatar.cc/160?img=14',
  'https://i.pravatar.cc/160?img=41',
  'https://i.pravatar.cc/160?img=9',
  'https://i.pravatar.cc/160?img=25',
] as const;

const addressLines = [
  '12 Nguyen Hue, District 1',
  '88 Le Loi, District 3',
  '102 Tran Hung Dao, District 5',
  '24 Vo Van Tan, Binh Thanh',
] as const;

const datePresets = [
  '06/30/2003',
  '09/12/1998',
  '11/08/2000',
  '03/26/1997',
] as const;

export const employeeMockData: EmployeeItem[] = Array.from({ length: 30 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index * 3) % lastNames.length];
  const role = employeeRoles[index % employeeRoles.length];
  const name = `${firstName} ${lastName}`;
  const normalizedFirstName = firstName.toLowerCase();
  const normalizedLastName = lastName.toLowerCase();

  return {
    id: `employee-${index + 1}`,
    name,
    role: role.role,
    bio: role.bio,
    avatarUrl: avatarUrls[index % avatarUrls.length],
    accentColor: accentPalette[index % accentPalette.length],
    employeeCode: `${1200 + index}`,
    phone: `(+84) 90${(index + 2).toString().padStart(2, '0')} ${(index * 37 + 124).toString().padStart(3, '0')} ${(index * 53 + 412).toString().padStart(3, '0')}`,
    email: `${normalizedFirstName}.${normalizedLastName}@rcmanage.app`,
    dob: datePresets[index % datePresets.length],
    address: addressLines[index % addressLines.length],
    startDate: datePresets[(index + 1) % datePresets.length],
    status: index % 5 === 0 ? 'inactive' : 'active',
  };
});
