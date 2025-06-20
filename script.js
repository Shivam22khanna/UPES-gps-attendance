const allowedLat = 30.4165013;
const allowedLng = 77.9671812;
const radiusMeters = 100;

const form = document.getElementById('register-form');
const markBtn = document.getElementById('mark-btn');
const status = document.getElementById('status');

const user = JSON.parse(localStorage.getItem('user'));

if (user) {
  form.style.display = 'none';
  status.innerText = `Welcome back, ${user.name}`;
  markBtn.style.display = 'block';
} else {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const user = { name, email, phone };
    localStorage.setItem('user', JSON.stringify(user));
    location.reload();
  });
}

markBtn?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    status.innerText = "Geolocation is not supported by your browser.";
    return;
  }

  status.innerText = "Getting your location...";

  navigator.geolocation.getCurrentPosition(success, () => {
    status.innerText = "Failed to get your location.";
  });

  function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    console.log("Latitude:", lat, "Longitude:", lng);
    
    const distance = getDistanceFromLatLonInMeters(lat, lng, allowedLat, allowedLng);
    console.log("Distance:", distance);
    console.log("Allowed radius:", radiusMeters);

    if (distance <= radiusMeters) {
      status.innerText = "✅ Inside location. Marking attendance...";
      sendAttendance(user.name, user.email, user.phone, lat, lng);
    } else {
      status.innerText = "❌ You are not within the allowed area.";
    }
  }
});

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function sendAttendance(name, email, phone, lat, lng) {
//   const baseURL = 'https://script.google.com/macros/s/AKfycbwqNfX8-oZwuHvhcQL33ZIU-E-5DPkCtJ6z1tZ85haOmVwvF9gHOYnGd7GSK984tSlF/exec';
  const baseURL = "https://script.google.com/macros/s/AKfycbxh0UG0FU0d0_sBVL6lSywscSgMREaTeSptgwQGXI5jbTMzHSIfMG2FQzD3dCzbqmEx/exec";


  const params = new URLSearchParams({
    name: name,
    email: email,
    phone: phone,
    lat: lat,
    lng: lng
  });

  const urlWithParams = `${baseURL}?${params.toString()}`;

  fetch(urlWithParams, {
    method: 'GET',
    mode: 'no-cors'
  })
  .then(() => {
    document.getElementById("status").innerText = "✅ Attendance marked successfully!";
  })
  .catch(error => {
    console.error("❌ Error:", error);
    document.getElementById("status").innerText = "❌ Failed to mark attendance.";
  });
}
