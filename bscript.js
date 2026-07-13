// ===================== DATA =====================
const doctors = [
  { id: "d1", name: "Dr. Ananya Sharma", dept: "Cardiology", meta: "14 yrs experience", initials: "AS" },
  { id: "d2", name: "Dr. Rohan Mehta", dept: "Neurology", meta: "11 yrs experience", initials: "RM" },
  { id: "d3", name: "Dr. Priya Nair", dept: "Pediatrics", meta: "9 yrs experience", initials: "PN" },
  { id: "d4", name: "Dr. Arjun Verma", dept: "Orthopedics", meta: "16 yrs experience", initials: "AV" },
  { id: "d5", name: "Dr. Kavya Iyer", dept: "Dermatology", meta: "7 yrs experience", initials: "KI" },
  { id: "d6", name: "Dr. Siddharth Rao", dept: "General Medicine", meta: "12 yrs experience", initials: "SR" },
];

// ===================== ELEMENTS =====================
const doctorGrid = document.getElementById('doctorGrid');
const doctorSelect = document.getElementById('doctorSelect');
const departmentSelect = document.getElementById('department');
const banner = document.getElementById('selectedDoctorBanner');
const bannerAvatar = document.getElementById('bannerAvatar');
const bannerName = document.getElementById('bannerName');
const bannerSpec = document.getElementById('bannerSpec');
const clearDoctorBtn = document.getElementById('clearDoctorBtn');
const timeChips = document.querySelectorAll('#timeChips .chip');
const form = document.getElementById('appointmentForm');
const errorNote = document.getElementById('errorNote');
const modalOverlay = document.getElementById('modalOverlay');
const refCodeEl = document.getElementById('refCode');
const confirmDetails = document.getElementById('confirmDetails');
const closeModalBtn = document.getElementById('closeModalBtn');
const bookAnotherBtn = document.getElementById('bookAnotherBtn');

let selectedTime = null;

// ===================== RENDER DOCTOR CARDS =====================
function renderDoctorCards() {
  doctorGrid.innerHTML = doctors.map(doc => `
    <div class="doctor-card" data-id="${doc.id}">
      <div class="availability"><span class="dot"></span> Available Today</div>
      <div class="doc-avatar">${doc.initials}</div>
      <div class="doc-name">${doc.name}</div>
      <div class="doc-spec">${doc.dept}</div>
      <div class="doc-meta">${doc.meta}</div>
      <button type="button" class="doc-pick">Select Doctor</button>
    </div>
  `).join('');

  doctorGrid.querySelectorAll('.doctor-card').forEach(card => {
    card.addEventListener('click', () => selectDoctor(card.dataset.id, true));
  });
}

function populateDoctorSelect(filterDept) {
  const list = filterDept ? doctors.filter(d => d.dept === filterDept) : doctors;
  doctorSelect.innerHTML = '<option value="" disabled selected>Select doctor</option>' +
    list.map(d => `<option value="${d.id}">${d.name} — ${d.dept}</option>`).join('');
}

// ===================== SELECT DOCTOR =====================
function selectDoctor(id, scrollToForm) {
  const doc = doctors.find(d => d.id === id);
  if (!doc) return;

  // sync department field
  departmentSelect.value = doc.dept;
  populateDoctorSelect(doc.dept);
  doctorSelect.value = doc.id;

  // highlight card
  doctorGrid.querySelectorAll('.doctor-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === id);
  });

  // show banner
  bannerAvatar.textContent = doc.initials;
  bannerName.textContent = doc.name;
  bannerSpec.textContent = doc.dept;
  banner.classList.add('show');

  if (scrollToForm) {
    document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
  }
}

clearDoctorBtn.addEventListener('click', () => {
  banner.classList.remove('show');
  doctorGrid.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
  doctorSelect.value = "";
});

// department dropdown filters doctor list
departmentSelect.addEventListener('change', () => {
  populateDoctorSelect(departmentSelect.value);
});

// doctor dropdown selection also highlights card + banner
doctorSelect.addEventListener('change', () => {
  if (doctorSelect.value) selectDoctor(doctorSelect.value, false);
});

// ===================== TIME CHIPS =====================
timeChips.forEach(chip => {
  chip.addEventListener('click', () => {
    timeChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedTime = chip.dataset.time;
  });
});

// ===================== FORM SUBMIT =====================
function generateRef() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `VRH-${n}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorNote.textContent = "";

  const name = document.getElementById('patientName').value.trim();
  const phone = document.getElementById('patientPhone').value.trim();
  const email = document.getElementById('patientEmail').value.trim();
  const dept = departmentSelect.value;
  const docId = doctorSelect.value;
  const date = document.getElementById('apptDate').value;
  const notes = document.getElementById('notes').value.trim();

  if (!name || !phone || !email || !dept || !docId || !date || !selectedTime) {
    errorNote.textContent = "Please fill in all required fields and pick a time slot.";
    return;
  }

  const doc = doctors.find(d => d.id === docId);
  const ref = generateRef();

  // populate modal
  refCodeEl.textContent = `REF: ${ref}`;
  confirmDetails.innerHTML = `
    <div class="row"><span>Patient</span><span>${escapeHtml(name)}</span></div>
    <div class="row"><span>Doctor</span><span>${escapeHtml(doc ? doc.name : '—')}</span></div>
    <div class="row"><span>Department</span><span>${escapeHtml(dept)}</span></div>
    <div class="row"><span>Date</span><span>${formatDate(date)}</span></div>
    <div class="row"><span>Time Slot</span><span>${escapeHtml(selectedTime)}</span></div>
    <div class="row"><span>Contact</span><span>${escapeHtml(phone)}</span></div>
  `;

  // restart the checkmark draw animation
  const pcLine = document.querySelector('.pc-line');
  pcLine.style.animation = 'none';
  requestAnimationFrame(() => { pcLine.style.animation = 'pcDraw 1s ease forwards'; });

  openModal();
  resetForm();
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

// ===================== RESET FORM =====================
function resetForm() {
  form.reset();
  timeChips.forEach(c => c.classList.remove('active'));
  selectedTime = null;
  banner.classList.remove('show');
  doctorGrid.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
  populateDoctorSelect(null);
  errorNote.textContent = "";
}

// ===================== MODAL CONTROLS =====================
function openModal() {
  modalOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('show');
  document.body.style.overflow = '';
}
closeModalBtn.addEventListener('click', closeModal);
bookAnotherBtn.addEventListener('click', () => {
  closeModal();
  document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
});
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===================== INIT =====================
renderDoctorCards();
populateDoctorSelect(null);

// prevent picking a past date
document.getElementById('apptDate').min = new Date().toISOString().split('T')[0];