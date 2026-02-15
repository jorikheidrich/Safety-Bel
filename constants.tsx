
import { UserRole, AppConfig, Department } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  appName: 'VCA BEL',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
  lmraQuestions: [
    'Weet ik precies wat ik moet doen?',
    'Zijn de risico\'s van de werkplek bekend?',
    'Draag ik de juiste PBM\'s?',
    'Is het gereedschap in goede staat?',
    'Zijn vluchtwegen en nooduitgangen vrij?',
    'Is er voldoende verlichting?',
    'Ben ik fit en gezond om de taak uit te voeren?'
  ],
  kickoffTopics: [
    'LMRA procedures',
    'Werfreglement',
    'Noodplan',
    'Specifieke risico\'s',
    'PBM inspectie'
  ],
  departments: ['TELECOM', 'LAAGSPANNING', 'MIDDENSPANNING', 'ALGEMEEN'],
  permissions: {
    // Admin has full access
    [UserRole.ADMIN]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings'],
    // Preventieadviseur acts as a sub-admin
    [UserRole.PREVENTIE_ADVISEUR]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings'],
    // Moderator (Werfleider) now has FULL access as requested ("die alles kan")
    [UserRole.WERFLEIDER]: ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings'],
    // Management roles
    [UserRole.PROJECT_MANAGER]: ['dashboard', 'lmra', 'kickoff', 'reports', 'profile'],
    [UserRole.PROJECT_ASSISTENT]: ['dashboard', 'lmra', 'kickoff', 'profile'],
    // Techniekers remain limited to operations
    [UserRole.TECHNIEKER]: ['dashboard', 'lmra', 'kickoff', 'library', 'profile']
  }
};

export const MOCK_USERS = [
  { id: 'admin1', name: 'Jorik Admin', email: 'jorik@vcabel.be', username: 'jorik', password: 'jorik', role: UserRole.ADMIN, department: Department.GENERAL, isExternal: false },
  { id: 'mod1', name: 'Werner Werf', email: 'werner@vcabel.be', username: 'moderator', password: 'password', role: UserRole.WERFLEIDER, department: Department.GENERAL, isExternal: false },
  { id: 'pm1', name: 'Mark Manager', email: 'mark@projects.be', username: 'mark', password: 'mark', role: UserRole.PROJECT_MANAGER, department: Department.TELECOM, isExternal: false },
  { id: 'ext1', name: 'John Extern', email: 'john@contractor.com', username: 'john', password: 'password', role: UserRole.TECHNIEKER, department: Department.LAAGSPANNING, isExternal: true },
  { id: 'u1', name: 'Eddy Verhoeven', email: 'eddy@techniek.be', username: 'eddy', password: 'eddy', role: UserRole.TECHNIEKER, department: Department.LAAGSPANNING, isExternal: false }
];

export const SAFETY_DOCS = [
  { id: '1', category: 'VCA', title: 'Basisveiligheid VCA', content: 'De algemene regels voor veiligheid op de werkvloer volgens de VCA-normen.' },
  { id: '2', category: 'PBM', title: 'Gebruik van PBM', content: 'Wanneer en hoe je helm, schoenen en bril moet gebruiken.' },
  { id: '3', category: 'LMRA', title: 'LMRA Procedure', content: 'Hoe voer je een correcte Last Minute Risico Analyse uit?' }
];
