const SUPABASE_URL =
"https://akodraeqesulsofaanna.supabase.co";

const SUPABASE_KEY =
"sb_publishable_q6jaRXcDuGa6qXCU4FZrfA_OObM1r2C";

const client =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    async function login(username, password) {

    const { data, error } =

        await client
            .from("login")
            .select("*")
            .eq("username", username)
            .eq("password", password);

    if (error) {

        document.getElementById("msg")
            .innerHTML =
            error.message;

        return;
    }

    if (data.length === 0) {

        document.getElementById("msg")
            .innerHTML =
            "Invalid Username or Password";

        return;
    }

    localStorage.setItem(
        "user",
        username
    );

    window.location =
        "dashboard.html";
}

async function loadCourses() {

    const { data, error } =
        await client
            .from("courses")
            .select("*");

    if (error) {

        console.log(error);

        return;
    }

    const list =
        document.getElementById("courseList");

    list.innerHTML = "";

    data.forEach(course => {

        list.innerHTML += `

            <div class="course-card"
                 onclick="openCourse('${course.id}')">

                <img src="${course.thumbnail}">

                <div class="course-content">

                    <h2>${course.title}</h2>

                    <p>${course.description}</p>

                </div>

            </div>
        `;
    });
}

function openCourse(courseId) {

    localStorage.setItem(
        "courseId",
        courseId
    );

    window.location =
        "course-details.html";
}

async function loadCourseVideos() {

    const courseId =
        localStorage.getItem("courseId");

    const { data, error } =
        await client
            .from("videos")
            .select("*")
            .eq("course_id", courseId);

    const list =
        document.getElementById("videoList");

    list.innerHTML = "";

    data.forEach(video => {

        list.innerHTML += `

            <div class="video-card">

                <h3>${video.title}</h3>

                <video controls
                       onended="enableQuiz()">

                    <source
                        src="${video.video_url}"
                        type="video/mp4">

                </video>

            </div>
        `;
    });
}

function enableQuiz() {

    document
        .getElementById("quizBtn")
        .disabled = false;
}
async function openQuiz() {

    const courseId =
        localStorage.getItem("courseId");

    const { data, error } =
        await client
            .from("quizzes")
            .select("*")
            .eq("course_id", courseId)
            .single();

    if (error || !data) {

        alert("Quiz not found");

        return;
    }

    localStorage.setItem(
        "quizId",
        data.id
    );

    window.location =
        "quiz.html";
}

let questions = [];

async function loadQuiz() {

    const quizId =
        localStorage.getItem("quizId");

    const { data, error } =
        await client
            .from("questions")
            .select("*")
            .eq("quiz_id", quizId);

    questions = data;

    const form =
        document.getElementById("quizForm");

    form.innerHTML = "";

    data.forEach((q, index) => {

        form.innerHTML += `

            <div>

                <h3>
                    Question ${index + 1}:
                    ${q.question}
                </h3>

                <input type="radio"
                       name="q${index}"
                       value="${q.option1}">
                       ${q.option1}

                <br>

                <input type="radio"
                       name="q${index}"
                       value="${q.option2}">
                       ${q.option2}

                <br>

                <input type="radio"
                       name="q${index}"
                       value="${q.option3}">
                       ${q.option3}

                <br>

                <input type="radio"
                       name="q${index}"
                       value="${q.option4}">
                       ${q.option4}

                <br><br>

            </div>
        `;
    });
}

async function submitQuiz() {

    if (questions.length === 0) {

        alert("No Questions Found");

        return;
    }

    let score = 0;

    questions.forEach((q, index) => {

        const selected =
            document.querySelector(
                `input[name="q${index}"]:checked`
            );

        if (
            selected &&
            selected.value === q.correct_answer
        ) {

            score++;
        }
    });

    alert("Your Score: " + score);

    await client
        .from("results")
        .insert([
            {
                user_email:
                    localStorage.getItem("user"),

                quiz_id:
                    questions[0].quiz_id,

                score: score
            }
        ]);

    if (score >= 2) {

        window.location =
            "certificate.html";
    }
    else {

        alert("Quiz Failed");
    }
}

function logout() {

    localStorage.removeItem("user");

    window.location =
        "login.html";
}
