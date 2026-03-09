// Save Patient Data

document.addEventListener("DOMContentLoaded", function(){

let form = document.getElementById("patientForm")

if(form){

form.addEventListener("submit", function(e){

e.preventDefault()

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
}

let patients = JSON.parse(localStorage.getItem("patients")) || []

patients.push(patient)

localStorage.setItem("patients", JSON.stringify(patients))

form.reset()

})

}

generateSummary()

})



// Generate Statistics

function generateSummary(){

let table = document.querySelector("#summaryTable tbody")

if(!table) return

let patients = JSON.parse(localStorage.getItem("patients")) || []

let stats = {}

patients.forEach(p=>{

if(!stats[p.problem]){

stats[p.problem] = {

total:0,
male:0,
female:0,
ageSum:0

}

}

stats[p.problem].total++

stats[p.problem].ageSum += p.age

if(p.gender === "Male") stats[p.problem].male++
else stats[p.problem].female++

})

for(let problem in stats){

let avgAge = (stats[problem].ageSum / stats[problem].total).toFixed(1)

let row = `
<tr>
<td>${problem}</td>
<td>${stats[problem].total}</td>
<td>${stats[problem].male}</td>
<td>${stats[problem].female}</td>
<td>${avgAge}</td>
</tr>
`

table.innerHTML += row

}

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