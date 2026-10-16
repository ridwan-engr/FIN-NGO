import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BriefcaseBusiness, ListTodo, ClipboardCheck, UserRound, LogOut, Search, Clock3, CheckCircle2, Circle, CalendarDays, Upload, ArrowLeft, Save } from "lucide-react";
import useAuth from "../../hooks/useAuth.js";
import useAttendance from "../../hooks/useAttendance.js";
import useProjects from "../../hooks/useProjects.js";
import useTasks from "../../hooks/useTasks.js";
import useVolunteers from "../../hooks/useVolunteers.js";
import "./VolunteerPages.css";

const navItems = [
  { to: "/volunteer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/volunteer/tasks", label: "My tasks", icon: ListTodo },
  { to: "/volunteer/projects", label: "My projects", icon: BriefcaseBusiness },
  { to: "/volunteer/participation", label: "Attendance & hours", icon: ClipboardCheck },
  { to: "/volunteer/profile", label: "My profile", icon: UserRound },
];
const fmtDate = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Not set";
const fmtHours = (value) => `${Number(value || 0).toFixed(Number(value || 0) % 1 ? 1 : 0)}h`;
function useVolunteerRecord() {
  const { user } = useAuth();
  const { getVolunteerByAuthUserId, getVolunteerByEmail } = useVolunteers();
  return useMemo(() => user ? (getVolunteerByAuthUserId(user.id) ?? getVolunteerByEmail(user.email)) : null,
    [user, getVolunteerByAuthUserId, getVolunteerByEmail]);
}
function Status({ value }) {
  const tone = value === "Completed" || value === "Approved" || value === "Active" ? "good" : value === "In Progress" || value === "Pending" ? "pending" : "neutral";
  return <span className={`vp-status vp-status--${tone}`}>{value || "Not set"}</span>;
}
function PageHeading({ title, subtitle, action }) {
  return <div className="vp-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function Metric({ icon: Icon, label, value }) {
  return <article className="vp-metric"><span className="vp-metric__icon"><Icon size={19}/></span><div><span>{label}</span><strong>{value}</strong></div></article>;
}
function Empty({ children }) { return <div className="vp-empty">{children}</div>; }

export function VolunteerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Volunteer";
  const initials = name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  return <div className="vp-shell">
    <aside className="vp-sidebar">
      <NavLink to="/volunteer/dashboard" className="vp-brand"><span className="vp-brand__mark">FI</span><span><strong>FEASIBLE IMPACT</strong><small>Volunteer portal</small></span></NavLink>
      <nav className="vp-nav" aria-label="Volunteer navigation">{navItems.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive})=>`vp-nav__link${isActive?" is-active":""}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="vp-sidebar__footer"><span>Making impact together</span><button type="button" className="vp-logout" onClick={()=>{logout();navigate("/login",{replace:true});}}><LogOut size={17}/> Sign out</button></div>
    </aside>
    <div className="vp-main"><header className="vp-topbar"><div className="vp-mobile-brand"><span className="vp-brand__mark">FI</span><strong>Volunteer portal</strong></div><div className="vp-user"><span className="vp-avatar">{initials}</span><span className="vp-user__name">{name}</span><button type="button" className="vp-logout vp-logout--top" onClick={()=>{logout();navigate("/login",{replace:true});}} aria-label="Sign out"><LogOut size={17}/></button></div></header><main className="vp-content">{children}</main></div>
  </div>;
}


export function VolunteerHome() {
  const { user } = useAuth();
  const volunteer = useVolunteerRecord();
  const { getTasksByVolunteer } = useTasks();
  const { projects } = useProjects();
  const { getAttendanceByVolunteer } = useAttendance();

  const tasks = useMemo(
    () => volunteer ? getTasksByVolunteer(volunteer.id) : [],
    [volunteer, getTasksByVolunteer]
  );

  const records = useMemo(
    () => volunteer ? getAttendanceByVolunteer(volunteer.id) : [],
    [volunteer, getAttendanceByVolunteer]
  );

  const assignedProjects = projects.filter(
    project => volunteer?.projectIds?.includes(project.id)
  );

  const completed = tasks.filter(task => task.status === "Completed").length;
  const inProgress = tasks.filter(task => task.status === "In Progress").length;
  const notStarted = tasks.filter(task => task.status === "Not Started").length;

  const verifiedHours = records.reduce(
    (sum, record) => sum + Number(record.verifiedHours || 0),
    0
  );

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    volunteer?.firstName ||
    "Volunteer";

  return (
    <>
      <PageHeading
        title={`Welcome, ${name}`}
        subtitle="View your assigned projects and keep track of your volunteer tasks."
      />

      <div className="vp-metrics">
        <Metric icon={ListTodo} label="Assigned tasks" value={tasks.length} />
        <Metric icon={Circle} label="Not started" value={notStarted} />
        <Metric icon={Clock3} label="In progress" value={inProgress} />
        <Metric icon={CheckCircle2} label="Completed" value={completed} />
        <Metric
          icon={BriefcaseBusiness}
          label="My projects"
          value={assignedProjects.length}
        />
        <Metric
          icon={ClipboardCheck}
          label="Verified hours"
          value={fmtHours(verifiedHours)}
        />
      </div>

      <section className="vp-panel">
        <div className="vp-heading">
          <div>
            <h2>My tasks</h2>
            <p>Review your current assignments and task progress.</p>
          </div>
          <NavLink className="vp-button vp-button--outline" to="/volunteer/tasks">
            View all tasks
          </NavLink>
        </div>

        {tasks.length ? (
          <div className="vp-task-list">
            {tasks.slice(0, 5).map(task => (
              <article className="vp-panel vp-task" key={task.id}>
                <div className="vp-task__top">
                  <span className="vp-task__icon">
                    <ListTodo size={19} />
                  </span>
                  <Status value={task.status} />
                </div>

                <h3>{task.title}</h3>
                <p>{task.description || "No description provided."}</p>

                <div className="vp-task__meta">
                  <span>
                    <BriefcaseBusiness size={15} />
                    {assignedProjects.find(
                      project => project.id === task.projectId
                    )?.name || "Assigned project"}
                  </span>
                  <span>
                    <CalendarDays size={15} />
                    Due {fmtDate(task.dueDate)}
                  </span>
                </div>

                <NavLink
                  className="vp-button vp-button--outline"
                  to="/volunteer/tasks"
                >
                  Open tasks
                </NavLink>
              </article>
            ))}
          </div>
        ) : (
          <Empty>
            No tasks are assigned to you yet. Your coordinator's assignments
            will appear here.
          </Empty>
        )}
      </section>

      <section className="vp-panel">
        <div className="vp-heading">
          <div>
            <h2>My projects</h2>
            <p>Track the projects you are assigned to.</p>
          </div>
          <NavLink
            className="vp-button vp-button--outline"
            to="/volunteer/projects"
          >
            View projects
          </NavLink>
        </div>

        {assignedProjects.length ? (
          <div className="vp-project-grid">
            {assignedProjects.slice(0, 3).map(project => {
              const projectTasks = tasks.filter(
                task => task.projectId === project.id
              );
              const projectCompleted = projectTasks.filter(
                task => task.status === "Completed"
              ).length;
              const progress = projectTasks.length
                ? Math.round(projectCompleted / projectTasks.length * 100)
                : 0;

              return (
                <article className="vp-panel vp-project-card" key={project.id}>
                  <span className="vp-project-icon">
                    <BriefcaseBusiness size={20} />
                  </span>
                  <Status value={project.status || "Active"} />
                  <h2>{project.name}</h2>
                  <p>{project.description || "Your assigned project."}</p>
                  <div className="vp-progress-label">
                    <span>Task completion</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div
                    className="vp-progress"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${project.name} task completion`}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Empty>
            You have no project assignments yet.
          </Empty>
        )}
      </section>

      <section className="vp-panel">
        <div className="vp-heading">
          <div>
            <h2>Attendance and participation</h2>
            <p>Review your attendance records and verified volunteer hours.</p>
          </div>
          <NavLink
            className="vp-button vp-button--outline"
            to="/volunteer/attendance"
          >
            View attendance
          </NavLink>
        </div>
        <div className="vp-metrics">
          <Metric
            icon={CalendarDays}
            label="Attendance records"
            value={records.length}
          />
          <Metric
            icon={Clock3}
            label="Verified hours"
            value={fmtHours(verifiedHours)}
          />
        </div>
      </section>
    </>
  );
}

export function VolunteerTasks() {
  const volunteer = useVolunteerRecord();
  const { getTasksByVolunteer, updateTaskStatus } = useTasks();
  const { projects } = useProjects();
  const [filter,setFilter] = useState("All");
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState(null);
  const assigned = useMemo(()=>volunteer ? getTasksByVolunteer(volunteer.id) : [],[volunteer,getTasksByVolunteer]);
  const shown = assigned.filter(t=>(filter==="All"||t.status===filter)&&`${t.title} ${t.description||""}`.toLowerCase().includes(query.toLowerCase()));
  const projectName = (id)=>projects.find(p=>p.id===id)?.name || "Project";
  const [evidence,setEvidence] = useState(null);
  const [checklist,setChecklist] = useState({});
  return <><PageHeading title="My tasks" subtitle="Review your assignments, update progress and submit task evidence."/>
    <div className="vp-metrics"><Metric icon={ListTodo} label="Assigned tasks" value={assigned.length}/><Metric icon={Clock3} label="In progress" value={assigned.filter(t=>t.status==="In Progress").length}/><Metric icon={CheckCircle2} label="Completed" value={assigned.filter(t=>t.status==="Completed").length}/></div>
    <div className="vp-toolbar"><label className="vp-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks"/></label><div className="vp-filters">{["All","Not Started","In Progress","Completed"].map(s=><button key={s} className={`vp-filter${filter===s?" is-active":""}`} onClick={()=>setFilter(s)}>{s}</button>)}</div></div>
    {selected ? <section className="vp-panel"><button className="vp-back" onClick={()=>setSelected(null)}><ArrowLeft size={16}/> Back to tasks</button><div className="vp-heading"><div><h2>{selected.title}</h2><p>{projectName(selected.projectId)}</p></div><Status value={selected.status}/></div><p className="vp-description">{selected.description || "No additional task description has been provided."}</p><h3>Task checklist</h3><div className="vp-checklist">{["Review task instructions","Complete assigned activity","Confirm results with project lead"].map((label,i)=><label key={label}><input type="checkbox" checked={Boolean(checklist[`${selected.id}-${i}`])} onChange={e=>setChecklist(v=>({...v,[`${selected.id}-${i}`]:e.target.checked}))}/>{label}</label>)}</div><h3>Evidence / supporting file</h3><label className="vp-upload"><Upload size={18}/><span>{evidence?.name || "Choose a file to attach (preview only)"}</span><input type="file" onChange={e=>setEvidence(e.target.files?.[0]||null)}/></label><p className="vp-hint">The selected file is not uploaded to a server in this frontend-only version.</p><div className="vp-actions">{selected.status==="Not Started"&&<button className="vp-button" onClick={()=>{updateTaskStatus(selected.id,"In Progress");setSelected({...selected,status:"In Progress"});}}>Start task</button>}{selected.status==="In Progress"&&<button className="vp-button" onClick={()=>{updateTaskStatus(selected.id,"Completed");setSelected({...selected,status:"Completed"});}}>Mark completed</button>}</div></section> : <section className="vp-task-list">{shown.map(task=><article className="vp-panel vp-task" key={task.id}><div className="vp-task__top"><span className="vp-task__icon"><Circle size={19}/></span><Status value={task.status}/></div><h3>{task.title}</h3><p>{task.description || "No description provided."}</p><div className="vp-task__meta"><span><BriefcaseBusiness size={15}/>{projectName(task.projectId)}</span><span><CalendarDays size={15}/>Due {fmtDate(task.dueDate)}</span></div><button className="vp-button vp-button--outline" onClick={()=>{setSelected(task);setEvidence(null);}}>View task details</button></article>)}{!shown.length&&<Empty>No tasks match these filters. If you expected an assignment, contact your project coordinator.</Empty>}</section>}
  </>;
}

export function VolunteerProjects() {
  const volunteer=useVolunteerRecord(); const {projects}=useProjects(); const {getTasksByVolunteer}=useTasks();
  const assignedTasks=useMemo(()=>volunteer?getTasksByVolunteer(volunteer.id):[],[volunteer,getTasksByVolunteer]);
  const myProjects=projects.filter(p=>volunteer?.projectIds?.includes(p.id));
  const [expanded,setExpanded]=useState(null);
  return <><PageHeading title="My projects" subtitle="Explore your project assignments and contribution progress."/><div className="vp-project-grid">{myProjects.map(project=>{const projectTasks=assignedTasks.filter(t=>t.projectId===project.id);const completed=projectTasks.filter(t=>t.status==="Completed").length;const progress=projectTasks.length?Math.round(completed/projectTasks.length*100):0;return <article className="vp-panel vp-project-card" key={project.id}><span className="vp-project-icon"><BriefcaseBusiness size={20}/></span><Status value={project.status||"Active"}/><h2>{project.name}</h2><p>{project.description||"Your assigned project. Check your tasks for the next actions."}</p><div className="vp-progress-label"><span>Task completion</span><strong>{progress}%</strong></div><div className="vp-progress"><span style={{width:`${progress}%`}}/></div><div className="vp-project-meta"><span>{projectTasks.length} assigned tasks</span><span>{completed} completed</span></div><button className="vp-button vp-button--outline" onClick={()=>setExpanded(expanded===project.id?null:project.id)}>{expanded===project.id?"Hide tasks":"View project tasks"}</button>{expanded===project.id&&<div className="vp-inline-tasks">{projectTasks.length?projectTasks.map(t=><div key={t.id}><span>{t.title}</span><Status value={t.status}/></div>):<p>No tasks currently assigned for this project.</p>}</div>}</article>})}{!myProjects.length&&<Empty>You do not have any project assignments yet. Your coordinator can assign you to a project.</Empty>}</div></>;
}

export function VolunteerParticipation() {
  const volunteer=useVolunteerRecord(); const {getAttendanceByVolunteer,createCheckIn,checkOut}=useAttendance(); const {projects}=useProjects(); const {getTasksByVolunteer}=useTasks(); const {recordVolunteerActivity}=useVolunteers();
  const records=useMemo(()=>volunteer?getAttendanceByVolunteer(volunteer.id):[],[volunteer,getAttendanceByVolunteer]);
  const active=records.find(r=>!r.checkOutAt);
  const assignedTasks=useMemo(()=>volunteer?getTasksByVolunteer(volunteer.id):[],[volunteer,getTasksByVolunteer]);
  const [taskId,setTaskId]=useState("");
  const [message,setMessage]=useState("");
  const submitted=records.reduce((sum,r)=>sum+Number(r.submittedHours||0),0);
  const verified=records.reduce((sum,r)=>sum+Number(r.verifiedHours||0),0);
  function start(){const task=assignedTasks.find(t=>t.id===taskId);if(!volunteer||!task){setMessage("Choose one of your assigned tasks before checking in.");return;}if(!volunteer.projectIds?.includes(task.projectId)){setMessage("You must be assigned to this project before checking in.");return;}const record=createCheckIn({volunteerId:volunteer.id,projectId:task.projectId,taskId:task.id});if(record){recordVolunteerActivity(volunteer.id,record.checkInAt);setMessage("Check-in recorded. Remember to check out when finished.");}}
  function finish(){if(!active)return;const record=checkOut(active.id);if(record){recordVolunteerActivity(volunteer.id,record.checkOutAt);setMessage("Check-out recorded. Your submitted hours are pending coordinator verification.");}}
  return <><PageHeading title="Attendance & participation" subtitle="Record your project attendance and track submitted and verified hours."/><div className="vp-metrics"><Metric icon={Clock3} label="Verified hours" value={fmtHours(verified)}/><Metric icon={CalendarDays} label="Submitted hours" value={fmtHours(submitted)}/><Metric icon={ClipboardCheck} label="Attendance records" value={records.length}/></div><section className="vp-panel vp-attendance-action"><div><h2>{active?"You are checked in":"Record attendance"}</h2><p>{active?"An active session is in progress. Check out when your activity is complete.":"Select an assigned task to record the start of your volunteer activity."}</p>{active&&<p className="vp-session">Checked in: {fmtDate(active.checkInAt)}</p>}</div>{!active&&<label className="vp-field">Assigned task<select value={taskId} onChange={e=>setTaskId(e.target.value)}><option value="">Select a task</option>{assignedTasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}<button className="vp-button" onClick={active?finish:start} disabled={!active&&!taskId}>{active?"Check out":"Check in"}</button>{message&&<p className="vp-message" role="status">{message}</p>}</section><section className="vp-panel"><h2>Attendance history</h2>{records.length?<div className="vp-table-wrap"><table className="vp-table"><thead><tr><th>Project</th><th>Check-in</th><th>Check-out</th><th>Submitted</th><th>Verified</th><th>Status</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{projects.find(p=>p.id===r.projectId)?.name||"Project"}</td><td>{r.checkInAt?new Date(r.checkInAt).toLocaleString("en-GB"):"â€”"}</td><td>{r.checkOutAt?new Date(r.checkOutAt).toLocaleString("en-GB"):"In progress"}</td><td>{r.submittedHours==null?"â€”":fmtHours(r.submittedHours)}</td><td>{r.verifiedHours==null?"Pending":fmtHours(r.verifiedHours)}</td><td><Status value={r.status}/></td></tr>)}</tbody></table></div>:<Empty>No attendance records yet. Check in when you begin an assigned activity.</Empty>}</section></>;
}

export function VolunteerProfile() {
  const volunteer=useVolunteerRecord(); const {updateVolunteer}=useVolunteers(); const {user}=useAuth();
  const [form,setForm]=useState(null); const [saved,setSaved]=useState(false);
  const initial=useMemo(()=>({firstName:volunteer?.firstName||user?.firstName||"",lastName:volunteer?.lastName||user?.lastName||"",email:volunteer?.email||user?.email||"",phone:volunteer?.phone||"",location:volunteer?.location||"",skills:Array.isArray(volunteer?.skills)?volunteer.skills.join(", "):""}),[volunteer,user]);
  const values=form||initial;
  function save(e){e.preventDefault();if(volunteer){updateVolunteer(volunteer.id,{...values,skills:values.skills.split(",").map(s=>s.trim()).filter(Boolean)});}setSaved(true);}
  return <><PageHeading title="My profile" subtitle="Keep your contact details, location and skills up to date."/><div className="vp-profile-layout"><section className="vp-panel vp-profile-summary"><span className="vp-avatar vp-avatar--large">{`${values.firstName[0]||"V"}${values.lastName[0]||"O"}`.toUpperCase()}</span><h2>{`${values.firstName} ${values.lastName}`.trim()||"Volunteer profile"}</h2><p>{values.email}</p><Status value={volunteer?.status||"Active"}/><div className="vp-profile-hours"><strong>{fmtHours(volunteer?.verifiedHours)}</strong><span>Verified volunteer hours</span></div></section><section className="vp-panel"><h2>Personal information</h2><form className="vp-form" onSubmit={save}><div className="vp-form-grid"><label className="vp-field">First name<input required value={values.firstName} onChange={e=>{setForm({...values,firstName:e.target.value});setSaved(false);}}/></label><label className="vp-field">Last name<input required value={values.lastName} onChange={e=>{setForm({...values,lastName:e.target.value});setSaved(false);}}/></label><label className="vp-field">Email address<input type="email" value={values.email} readOnly/></label><label className="vp-field">Phone number<input value={values.phone} onChange={e=>{setForm({...values,phone:e.target.value});setSaved(false);}} placeholder="Add phone number"/></label><label className="vp-field">Location<input value={values.location} onChange={e=>{setForm({...values,location:e.target.value});setSaved(false);}} placeholder="City or community"/></label><label className="vp-field vp-field--wide">Skills (comma-separated)<textarea rows="3" value={values.skills} onChange={e=>{setForm({...values,skills:e.target.value});setSaved(false);}} placeholder="e.g. Teaching, First aid, Logistics"/></label></div><div className="vp-actions"><button className="vp-button"><Save size={16}/> Save profile</button>{saved&&<span className="vp-message" role="status">Profile changes saved in this browser.</span>}</div></form><p className="vp-hint">Profile updates are stored through the existing frontend data service; account email cannot be changed here.</p></section></div></>;
}


