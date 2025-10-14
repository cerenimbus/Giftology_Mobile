// Mock API (replace with real endpoints later)
export async function AuthorizeDevice({ email, password }) {
  await new Promise((r) => setTimeout(r, 700));
  return { success: true, authorization_code: 'demo-auth-code-1234' };
}

export async function AuthorizeUser({ code }) {
  await new Promise((r) => setTimeout(r, 600));
  if (!code) return { success: false, message: 'No code provided' };
  if (code === '123456' || code === 'demo-valid-code' || code === 'demo-auth-code-1234') {
    return { success: true };
  }
  return { success: false, message: 'Invalid code' };
}

export async function GetTaskList() {
  await new Promise((r) => setTimeout(r, 400));
  return {
    success: true,
    tasks: [
      { id: '1', name: 'James', note: 'Introduction', date: 'Sep 9', done: false },
      { id: '2', name: 'kharl', note: 'Clarity Conversation', date: 'Sep 14', done: false },
      { id: '3', name: 'Jimmy', note: 'Gift', date: 'Sep 24', done: false },
      { id: '4', name: 'Loren', note: 'DOV', date: 'Sep 26', done: false }
    ]
  };
}

export async function GetDashboard() {
  await new Promise((r) => setTimeout(r, 400));
  return {
    success: true,
    data: {
      tasksSummary: [
        { name: 'James', date: 'Sep 9' },
        { name: 'kharl', date: 'Sep 14' },
        { name: 'Jimmy', date: 'Sep 24' }
      ],
      dovTotal: 89087,
      outcomes: { introductions: 3671, referrals: 4471, partners: 3671 },
    }
  };
}

export async function GetContactList() {
  await new Promise((r) => setTimeout(r, 350));
  const names = ['Charly Oman','Jhon de rosa','Martin Mayers','kent Mayers','kerk Mayers','Allen Mayers','willma Mayers','Alexander Ace','Kent Mayers','Ava Torres','Lucas Mendoza','Ethan Brooks'];
  const list = names.map((n,i)=>({ id: String(i+1), name: n, status: i%2===0? 'Active':'Inactive', phone: '(225) 555-0118' }));
  return { success: true, contacts: list };
}

export async function UpdateTaskDone(id) {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

export async function ForgotPassword({ email }) {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, message: `Password reset sent to ${email}` };
}

export async function CreateFeedback(payload) {
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, message: 'Thanks for the feedback' };
}

export async function GetHelp({ topic }) {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true, help: `Help content for ${topic}` };
}
