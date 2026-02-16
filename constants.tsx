
import { UserRole, AppConfig, Department, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Jorik Belloy',
    email: 'jorik@belloy.be',
    username: 'jorik',
    password: 'jorik',
    role: UserRole.ADMIN,
    department: Department.GENERAL,
    isExternal: false,
    timestamp: 1700000000000,
    isActive: true
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  appName: 'VCA BEL',
  logoUrl: 'https://media.licdn.com/dms/image/v2/D4E3DAQHQk-ctWicDOw/image-scale_191_1128/image-scale_191_1128/0/1724226845992/belloy_elektrotechniek_cover?e=2147483647&v=beta&t=gqx4Q1vwSTAH8EbSBQATps6q1cLaAi1KksPRpvYxojw',
  departments: ['TELECOM', 'LAAGSPANNING', 'MIDDENSPANNING', 'ALGEMEEN'],
  lmraQuestions: [
    "Begrijp ik de taak en de risico's?",
    "Zijn de nodige PBM's aanwezig en in goede staat?",
    "Is de werkplek veilig en voldoende verlicht?",
    "Is het gereedschap gekeurd en veilig?",
    "Is er gevaar voor derden (omstaanders)?",
    "Zijn alle vergunningen aanwezig?",
    "Weet ik wat te doen bij een noodsituatie?"
  ],
  kickoffTopics: [
    "Project scope en doelstellingen",
    "Specifieke werfrisico's",
    "PBM vereisten",
    "Noodprocedures en EHBO",
    "Milieuaspecten (afvalscheiding)",
    "Communicatie op de werf"
  ],
  permissions: {
    [UserRole.ADMIN]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings', 'manage_records'],
    [UserRole.WERFLEIDER]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings', 'manage_records'],
    [UserRole.PREVENTIE_ADVISEUR]: ['dashboard', 'lmra', 'nok', 'reports', 'library', 'profile'],
    [UserRole.PROJECT_MANAGER]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile'],
    [UserRole.PROJECT_ASSISTENT]: ['dashboard', 'lmra', 'kickoff', 'library', 'profile'],
    [UserRole.TECHNIEKER]: ['dashboard', 'lmra', 'kickoff', 'library', 'profile']
  }
};

export const SAFETY_DOCS = [
  {
    id: '1',
    category: 'PBM',
    title: 'Gebruik van Veiligheidshelmen',
    content: 'Een veiligheidshelm is verplicht op elke werf waar risico bestaat op vallende voorwerpen. Vervang de helm na een zware klap of na de vervaldatum.'
  },
  {
    id: '2',
    category: 'ELEKTRO',
    title: 'Werken aan Laagspanning',
    content: 'Zorg voor spanningsloze toestand. Gebruik de 5 veiligheidsregels: Vrijschakelen, Beveiligen tegen herinschakelen, Spanningsloosheid controleren, Aarden en kortsluiten, Naastgelegen actieve delen afschermen.'
  },
  {
    id: '3',
    category: 'HOOGTE',
    title: 'Ladderveiligheid',
    content: 'Plaats ladders altijd onder een hoek van 75 graden. Gebruik ladders enkel voor kortstondig werk. Zorg dat de ladder minstens 1 meter boven het overstappunt uitsteekt.'
  }
];
