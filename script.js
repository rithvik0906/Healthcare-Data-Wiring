// Save Patient Data

document.addEventListener("DOMContentLoaded", function(){

let form = document.getElementById("patientForm")

if(form){

	form.addEventListener("submit", function(e){
		e.preventDefault();

		// List of all field IDs
		const fieldIds = [
			"fname", "lname", "age", "gender", "phone",
			"problem", "appointmentDate", "appointmentTime", "doctorName"
		];
		let missing = fieldIds.filter(id => !document.getElementById(id));
		if (missing.length > 0) {
			alert("Missing field(s): " + missing.join(", "));
			console.error("Missing field(s):", missing);
			form.reset();
			return;
		}

		let patient = {
			fname: document.getElementById("fname").value,
			lname: document.getElementById("lname").value,
			age: parseInt(document.getElementById("age").value),
			gender: document.getElementById("gender").value,
			phone: document.getElementById("phone").value,
			problem: document.getElementById("problem").value,
			appointmentDate: document.getElementById("appointmentDate").value,
			appointmentTime: document.getElementById("appointmentTime").value,
			doctorName: document.getElementById("doctorName").value
		};

		let patients = JSON.parse(localStorage.getItem("patients")) || [];
		patients.push(patient);
		localStorage.setItem("patients", JSON.stringify(patients));

		form.reset();
	});

}

generateSummary()

})



// Generate Statistics

function generateSummary(){
	// --- Chart Data Preparation ---
	let diseaseLabels = [];
	let diseaseCounts = [];
	let ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '66+': 0 };



	// Disease/Problem summary table
	let table = document.querySelector("#summaryTable tbody");
	if (!table) return;
	table.innerHTML = "";

	// Doctor appointments table
	let doctorTable = document.querySelector("#doctorTable tbody");
	if (doctorTable) doctorTable.innerHTML = "";

	let patients = JSON.parse(localStorage.getItem("patients")) || [];
	if (patients.length === 0) {
		table.innerHTML = `<tr><td colspan="5" class="text-center">No data available</td></tr>`;
		if (doctorTable) doctorTable.innerHTML = `<tr><td colspan="2" class="text-center">No data available</td></tr>`;
		return;
	}

	// Problem/disease stats
	let stats = {};
	// Doctor appointment stats
	let doctorStats = {};

	patients.forEach(p => {
		// Normalize disease/problem name (trim, case-insensitive)
		let problem = (p.problem || "Unknown").trim();
		let gender = (p.gender || "").trim().toLowerCase();
		let doctor = (p.doctorName || "Unknown").trim();
		if (!problem) problem = "Unknown";
		if (!doctor) doctor = "Unknown";

		// Problem stats
		if (!stats[problem]) {
			stats[problem] = { total: 0, male: 0, female: 0, ageSum: 0 };
		}
		stats[problem].total++;
		stats[problem].ageSum += Number.isFinite(p.age) ? p.age : 0;
		if (gender === "male") stats[problem].male++;
		else if (gender === "female") stats[problem].female++;

		// Doctor stats
		if (!doctorStats[doctor]) doctorStats[doctor] = 0;
		doctorStats[doctor]++;

		// Disease frequency for bar chart
		// (Handled below from stats)

		// Age group for pie chart
		let age = Number(p.age);
		if (!isNaN(age)) {
			if (age <= 18) ageGroups['0-18']++;
			else if (age <= 35) ageGroups['19-35']++;
			else if (age <= 50) ageGroups['36-50']++;
			else if (age <= 65) ageGroups['51-65']++;
			else ageGroups['66+']++;
		}
	});

	Object.keys(stats).forEach(problem => {
		let avgAge = stats[problem].total > 0 ? (stats[problem].ageSum / stats[problem].total).toFixed(1) : "-";
		let row = `
			<tr>
				<td>${problem}</td>
				<td>${stats[problem].total}</td>
				<td>${stats[problem].male}</td>
				<td>${stats[problem].female}</td>
				<td>${avgAge}</td>
			</tr>
		`;
		table.innerHTML += row;

		// For bar chart
		diseaseLabels.push(problem);
		diseaseCounts.push(stats[problem].total);
	});

	// Fill doctor appointments table
	if (doctorTable) {
		Object.keys(doctorStats).forEach(doctor => {
			let row = `
				<tr>
					<td>${doctor}</td>
					<td>${doctorStats[doctor]}</td>
				</tr>
			`;
			doctorTable.innerHTML += row;
		});
	}

	// --- Render Charts ---
	// Destroy previous charts if they exist (for dynamic reload)
	if (window.diseaseBarChartObj) window.diseaseBarChartObj.destroy();
	if (window.agePieChartObj) window.agePieChartObj.destroy();

	// Bar Chart for Disease Frequency (smaller, white background)
	const barCtx = document.getElementById('diseaseBarChart').getContext('2d');
	window.diseaseBarChartObj = new Chart(barCtx, {
		type: 'bar',
		data: {
			labels: diseaseLabels,
			datasets: [{
				label: 'Number of Patients',
				data: diseaseCounts,
				backgroundColor: 'rgba(54, 162, 235, 0.7)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				title: { display: false },
				background: { color: '#fff' }
			},
			layout: { padding: 10 },
			scales: {
				y: { beginAtZero: true, precision: 0 }
			}
		}
	});

	// Pie Chart for Age Composition (smaller, white background)
	const pieCtx = document.getElementById('agePieChart').getContext('2d');
	window.agePieChartObj = new Chart(pieCtx, {
		type: 'pie',
		data: {
			labels: Object.keys(ageGroups),
			datasets: [{
				label: 'Age Composition',
				data: Object.values(ageGroups),
				backgroundColor: [
					'rgba(255, 99, 132, 0.7)',
					'rgba(255, 205, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(153, 102, 255, 0.7)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(255, 205, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(153, 102, 255, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'bottom' },
				title: { display: false },
				background: { color: '#fff' }
			},
			layout: { padding: 10 }
		}
	});
}



// Clear Data (for demo reset)

function clearData(){

if(confirm("Clear all stored patient data?")){

localStorage.removeItem("patients")
location.reload()

}

}



// Download Statistics

function downloadStats(){

let patients = JSON.parse(localStorage.getItem("patients")) || []

if(patients.length === 0){

alert("No data available")

return

}

let csv = "FirstName,LastName,Age,Gender,Phone,Problem,AppointmentDate,AppointmentTime,DoctorName\n"

patients.forEach(p=>{
    csv += `${p.fname},${p.lname},${p.age},${p.gender},${p.phone},${p.problem},${p.appointmentDate},${p.appointmentTime},${p.doctorName}\n`
})

let blob = new Blob([csv], {type:"text/csv"})

let link = document.createElement("a")

link.href = URL.createObjectURL(blob)

link.download = "patient_statistics.csv"

link.click()

}