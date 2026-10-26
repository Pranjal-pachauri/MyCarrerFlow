import {
    useContext,
    // useCallback,
    useEffect,
    useState
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faLinkedin,
    faGithub
} from "@fortawesome/free-brands-svg-icons";

import {
    faUser,
    faEnvelope,
    faPhone,
    faLocationDot,
    faGraduationCap,
    faCode,
    faFileLines,
    faPlus,
    faXmark,
    faGlobe,
    faTrash,
    faUpload,
    faFloppyDisk,
    faArrowUpRightFromSquare,
    faLink,
    faPen,
    faCheck,
    faBan
} from "@fortawesome/free-solid-svg-icons";

import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

 const emptyProfile = {
        phone: "",
        city: "",
        state: "",

        headline: "",
        bio: "",

        skills: [],

        codingProfiles: [],

        education: [],

        academic: {
            university: "",
            branch: "",
            graduationYear: "",
            cgpa: "",

            class12: {
                board: "",
                school: "",
                percentage: "",
                passingYear: ""
            },

            class10: {
                board: "",
                school: "",
                percentage: "",
                passingYear: ""
            }
        },

        social: {
            linkedin: "",
            github: "",
            portfolio: ""
        }
    };

 const normalizeProfile = (data = {}) => {

        return {
            ...emptyProfile,
            ...data,

            skills:
                Array.isArray(data.skills)
                    ? data.skills
                    : [],

            codingProfiles:
                Array.isArray(data.codingProfiles)
                    ? data.codingProfiles
                    : [],

            education:
                Array.isArray(data.education)
                    ? data.education
                    : [],

            academic: {
                ...emptyProfile.academic,
                ...(data.academic || {}),

                class12: {
                    ...emptyProfile.academic.class12,
                    ...(data.academic?.class12 || {})
                },

                class10: {
                    ...emptyProfile.academic.class10,
                    ...(data.academic?.class10 || {})
                }
            },

            social: {
                ...emptyProfile.social,
                ...(data.social || {})
            }
        };
    };

function Profile() {

    const {
        user,
        updateUser
    } = useContext(AuthContext);
    console.log("Logged-in user:", user);
console.log("User role:", user?.role);


    const [profile, setProfile] =
        useState(null);

    const [draftProfile, setDraftProfile] =
        useState(null);

    const [completion, setCompletion] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [editingSection, setEditingSection] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [skillInput, setSkillInput] =
        useState("");

    const [codingName, setCodingName] =
        useState("");

    const [codingUrl, setCodingUrl] =
        useState("");

    const [resumeFile, setResumeFile] =
        useState(null);


   


    /*
        Keeps missing nested objects safe.

        MongoDB may return only the fields that
        have actually been stored.
    */
   


    /*
        Deep copy helper.

        We use a separate draft while editing so
        Cancel can discard all unsaved changes.
    */
    const cloneProfile = (data) => {
        return JSON.parse(
            JSON.stringify(data)
        );
    };


 useEffect(() => {
    const loadProfile = async () => {
        try {
            const res = await api.get("/profile");

            const responseUser = res.data.user || res.data;

            const normalized = normalizeProfile(
                responseUser.profile || responseUser
            );

            setProfile(normalized);

            setCompletion(res.data.profileCompletion || 0);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load profile"
            );
        } finally {
            setLoading(false);
        }
    };

    loadProfile();
}, []);
    


    /*
        Start editing one section.

        We create a draft instead of modifying
        the actual displayed profile.
    */
    const startEdit = (section) => {

        setDraftProfile(
            cloneProfile(profile)
        );

        setEditingSection(section);

        setMessage("");
        setError("");

        setSkillInput("");
        setCodingName("");
        setCodingUrl("");
    };


    /*
        Cancel editing.

        Because all changes were made to draftProfile,
        the real profile remains untouched.
    */
    const cancelEdit = () => {

        setDraftProfile(null);

        setEditingSection(null);

        setSkillInput("");
        setCodingName("");
        setCodingUrl("");

        setMessage("");
        setError("");
    };


    /*
        Update a simple top-level profile field.
    */
    const updateDraftField = (
        field,
        value
    ) => {

        setDraftProfile((current) => ({
            ...current,
            [field]: value
        }));
    };


    /*
        Update academic fields.
    */
    const updateDraftAcademic = (
        field,
        value
    ) => {

        setDraftProfile((current) => ({
            ...current,

            academic: {
                ...current.academic,
                [field]: value
            }
        }));
    };


    /*
        Update Class 10 / Class 12.
    */
    const updateDraftClass = (
        className,
        field,
        value
    ) => {

        setDraftProfile((current) => ({
            ...current,

            academic: {
                ...current.academic,

                [className]: {
                    ...current.academic[className],
                    [field]: value
                }
            }
        }));
    };


    /*
        Update social profiles.
    */
    const updateDraftSocial = (
        field,
        value
    ) => {

        setDraftProfile((current) => ({
            ...current,

            social: {
                ...current.social,
                [field]: value
            }
        }));
    };


    /*
        Add skill to draft.

        Nothing is saved to MongoDB until
        Save Changes is clicked.
    */
    const addSkill = (event) => {

        if (
            event.key !== "Enter" &&
            event.type !== "click"
        ) {
            return;
        }

        event.preventDefault();

        const skill =
            skillInput.trim();

        if (!skill) {
            return;
        }

        const exists =
            draftProfile.skills.some(
                (item) =>
                    item.toLowerCase() ===
                    skill.toLowerCase()
            );

        if (exists) {

            setSkillInput("");

            return;
        }

        setDraftProfile((current) => ({
            ...current,

            skills: [
                ...current.skills,
                skill
            ]
        }));

        setSkillInput("");
    };


    const removeSkill = (skill) => {

        setDraftProfile((current) => ({
            ...current,

            skills:
                current.skills.filter(
                    (item) =>
                        item !== skill
                )
        }));
    };


    /*
        Add coding profile to draft.
    */
    const addCodingProfile = () => {

        const name =
            codingName.trim();

        const url =
            codingUrl.trim();

        if (!name || !url) {
            return;
        }

        setDraftProfile((current) => ({
            ...current,

            codingProfiles: [
                ...current.codingProfiles,

                {
                    name,
                    url
                }
            ]
        }));

        setCodingName("");
        setCodingUrl("");
    };


    const removeCodingProfile = (index) => {

        setDraftProfile((current) => ({
            ...current,

            codingProfiles:
                current.codingProfiles.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        }));
    };


    /*
        Education is created ONLY inside the draft.

        Clicking Add Education therefore does NOT
        immediately add anything to the actual profile.
    */
    const addEducation = () => {

        setDraftProfile((current) => ({
            ...current,

            education: [
                ...current.education,

                {
                    degree: "",
                    institution: "",
                    field: "",
                    startYear: "",
                    endYear: "",
                    grade: ""
                }
            ]
        }));
    };


    const updateEducation = (
        index,
        field,
        value
    ) => {

        setDraftProfile((current) => {

            const education = [
                ...current.education
            ];

            education[index] = {
                ...education[index],
                [field]: value
            };

            return {
                ...current,
                education
            };

        });
    };


    const removeEducation = (index) => {

        setDraftProfile((current) => ({
            ...current,

            education:
                current.education.filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
        }));
    };


    /*
        Save only the currently edited section.

        We still send the complete profile because
        your existing backend PUT /profile expects
        the profile object.
    */
    const saveSection = async () => {

        if (!draftProfile) {
            return;
        }

        setSaving(true);

        setMessage("");
        setError("");

        try {

            /*
                Remove completely empty education
                objects before saving.

                This prevents accidental blank
                education records.
            */
            const cleanedEducation =
                draftProfile.education.filter(
                    (education) =>
                        Object.values(
                            education
                        ).some(
                            (value) =>
                                String(value || "")
                                    .trim() !== ""
                        )
                );


            const profileToSave = {
                ...draftProfile,

                education:
                    cleanedEducation
            };


            const res =
                await api.put(
                    "/profile",
                    {
                        name: user.name,
                        email: user.email,
                        profile: profileToSave
                    }
                );


            // const normalized =
            //     normalizeProfile(
            //         res.data.user.profile
            //     );


            // setProfile(normalized);
        const responseUser = res.data.user || res.data;

const normalized = normalizeProfile(
    responseUser.profile || responseUser
);

setProfile(normalized);
updateUser(responseUser);    

            setCompletion(
                res.data.profileCompletion || 0
            );


            updateUser(
                res.data.user
            );


            setDraftProfile(null);

            setEditingSection(null);

            setSkillInput("");

            setCodingName("");

            setCodingUrl("");


            setMessage(
                "Changes saved successfully."
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to save changes"
            );

        } finally {

            setSaving(false);

        }
    };


    /*
        Resume upload is independent from section editing.
    */
    const uploadResume = async () => {

        if (!resumeFile) {
            return;
        }

        setSaving(true);

        setMessage("");
        setError("");


        const formData =
            new FormData();

        formData.append(
            "resume",
            resumeFile
        );


        try {

            const res =
                await api.post(
                    "/profile/resume",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );


            setCompletion(
                res.data.profileCompletion || 0
            );


            /*
                Update AuthContext without
                refreshing the entire page.
            */
            updateUser({
                ...user,
                resume: res.data.resume
            });


            setResumeFile(null);


            setMessage(
                "Resume uploaded successfully."
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Resume upload failed"
            );

        } finally {

            setSaving(false);

        }
    };


    const deleteResume = async () => {

        setSaving(true);

        setMessage("");
        setError("");


        try {

            const res =
                await api.delete(
                    "/profile/resume"
                );


            setCompletion(
                res.data.profileCompletion || 0
            );


            updateUser({
                ...user,
                resume: ""
            });


            setMessage(
                "Resume deleted successfully."
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to delete resume"
            );

        } finally {

            setSaving(false);

        }
    };


    if (loading) {

        return (
            <div className="profile-loading">
                Loading profile...
            </div>
        );
    }


    if (!profile) {
        return null;
    }


    const circleDegree =
        completion * 3.6;


    const isEditing = (section) =>
        editingSection === section;


    return (

        <div className="career-profile-page">

            <div className="career-profile-container">


                {/* =========================================
                    PROFILE HEADER
                ========================================= */}

    <section className="profile-page-header">

    <div className="profile-header-info">

        <span className="profile-eyebrow">
            My Profile
        </span>

        <h1 >
            {user.name}
        </h1>

        <p>
            {profile.headline ||
                "Complete your professional profile"}
        </p>

    </div>


                    {/* <div className="profile-completion-box">

                        <div
                            className="profile-completion-circle"
                            style={{
                                "--completion":
                                    `${circleDegree}deg`
                            }}
                        >

                            <div className="profile-completion-inner">

                                <strong>
                                    {completion}%
                                </strong>

                                <span>
                                    Complete
                                </span>

                            </div>

                        </div>


                        <div>

                            <strong>
                                Profile completion
                            </strong>

                            <p>
                                Keep your career profile
                                updated and ready for
                                opportunities.
                            </p>

                        </div>

                    </div> */}

                
{user.role === "student" && (
    <div className="profile-completion-box">

        <div
            className="profile-completion-circle"
            style={{
                "--completion": `${circleDegree}deg`
            }}
        >
            <div className="profile-completion-inner">
                <strong>{completion}%</strong>
                <span>Complete</span>
            </div>
        </div>

        <div>
            <strong>Profile completion</strong>
            <p>
                Keep your career profile updated and ready for opportunities.
            </p>
        </div>

    </div>
)}
    

                </section>


                {message && (

                    <div className="profile-success">

                        {message}

                    </div>

                )}


                {error && (

                    <div className="profile-error">

                        {error}

                    </div>

                )}


                {/* =========================================
                    PERSONAL INFORMATION
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faUser}
                        title="Personal Information"
                        description="Basic information about you."
                        editing={isEditing("personal")}
                        onEdit={() =>
                            startEdit("personal")
                        }
                    />


                    {isEditing("personal") ? (

                        <>

                            <div className="profile-grid">

                                <ProfileInput
                                    label="Full Name"
                                    icon={faUser}
                                    value={draftProfile.name || user.name}
                                    onChange={(value) =>
                                        updateDraftField(
                                            "name",
                                            value
                                        )
                                    }
                                    placeholder="Your full name"
                                />


                                <ProfileInput
                                    label="Email Address"
                                    icon={faEnvelope}
                                    value={
                                        draftProfile.email ||
                                        user.email
                                    }
                                    onChange={(value) =>
                                        updateDraftField(
                                            "email",
                                            value
                                        )
                                    }
                                    placeholder="Your email"
                                    type="email"
                                />


                                <ProfileInput
                                    label="Phone"
                                    icon={faPhone}
                                    value={
                                        draftProfile.phone
                                    }
                                    onChange={(value) =>
                                        updateDraftField(
                                            "phone",
                                            value
                                        )
                                    }
                                    placeholder="Enter phone number"
                                />


                                <ProfileInput
                                    label="City"
                                    icon={faLocationDot}
                                    value={
                                        draftProfile.city
                                    }
                                    onChange={(value) =>
                                        updateDraftField(
                                            "city",
                                            value
                                        )
                                    }
                                    placeholder="Enter city"
                                />


                                <ProfileInput
                                    label="State"
                                    value={
                                        draftProfile.state
                                    }
                                    onChange={(value) =>
                                        updateDraftField(
                                            "state",
                                            value
                                        )
                                    }
                                    placeholder="Enter state"
                                />

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        <div className="profile-view-grid">

                            <ViewField
                                label="Full Name"
                                value={user.name}
                                icon={faUser}
                            />

                            <ViewField
                                label="Email Address"
                                value={user.email}
                                icon={faEnvelope}
                            />

                            <ViewField
                                label="Phone"
                                value={profile.phone}
                                icon={faPhone}
                            />

                            <ViewField
                                label="City"
                                value={profile.city}
                                icon={faLocationDot}
                            />

                            <ViewField
                                label="State"
                                value={profile.state}
                            />

                        </div>

                    )}

                </section>

                { user?.role === "student" && (
                    <>
                {/* =========================================
                    PROFESSIONAL SUMMARY
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faUser}
                        title="Professional Summary"
                        description="Tell recruiters what you are interested in."
                        editing={isEditing("summary")}
                        onEdit={() =>
                            startEdit("summary")
                        }
                    />


                    {isEditing("summary") ? (

                        <>

                            <div className="profile-field">

                                <label>
                                    Professional Headline
                                </label>

                                <input
                                    value={
                                        draftProfile.headline
                                    }
                                    onChange={(e) =>
                                        updateDraftField(
                                            "headline",
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Computer Science Student | Full Stack Developer"
                                />

                            </div>


                            <div className="profile-field profile-textarea-field">

                                <label>
                                    About
                                </label>

                                <textarea
                                    value={
                                        draftProfile.bio
                                    }
                                    onChange={(e) =>
                                        updateDraftField(
                                            "bio",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Write a short professional introduction..."
                                    rows="6"
                                />

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        <div className="profile-summary-view">

                            <div className="profile-view-block">

                                <span>
                                    Professional Headline
                                </span>

                                <strong>
                                    {profile.headline ||
                                        "No headline added yet."}
                                </strong>

                            </div>


                            <div className="profile-view-block">

                                <span>
                                    About
                                </span>

                                <p>
                                    {profile.bio ||
                                        "No professional summary added yet."}
                                </p>

                            </div>

                        </div>

                    )}

                </section>

              


                {/* =========================================
                    SKILLS
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faCode}
                        title="Skills"
                        description="Technologies and skills you are comfortable with."
                        editing={isEditing("skills")}
                        onEdit={() =>
                            startEdit("skills")
                        }
                    />


                    {isEditing("skills") ? (

                        <>

                            <div className="skill-tags">

                                {draftProfile.skills.map(
                                    (skill) => (

                                        <span
                                            className="skill-tag"
                                            key={skill}
                                        >

                                            {skill}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSkill(
                                                        skill
                                                    )
                                                }
                                            >

                                                <FontAwesomeIcon
                                                    icon={faXmark}
                                                />

                                            </button>

                                        </span>

                                    )
                                )}

                            </div>


                            <div className="skill-input-row">

                                <input
                                    value={skillInput}
                                    onChange={(e) =>
                                        setSkillInput(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={addSkill}
                                    placeholder="Type a skill and press Enter"
                                />

                                <button
                                    type="button"
                                    className="profile-add-btn"
                                    onClick={addSkill}
                                >

                                    <FontAwesomeIcon
                                        icon={faPlus}
                                    />

                                    Add

                                </button>

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        profile.skills.length > 0 ? (

                            <div className="skill-tags">

                                {profile.skills.map(
                                    (skill) => (

                                        <span
                                            className="skill-tag"
                                            key={skill}
                                        >
                                            {skill}
                                        </span>

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                text="No skills added yet."
                            />

                        )

                    )}

                </section>


                {/* =========================================
                    EDUCATION
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faGraduationCap}
                        title="Education"
                        description="Your degrees and educational background."
                        editing={isEditing("education")}
                        onEdit={() =>
                            startEdit("education")
                        }
                    />


                    {isEditing("education") ? (

                        <>

                            {draftProfile.education.length > 0 ? (

                                <div className="education-edit-list">

                                    {draftProfile.education.map(
                                        (education, index) => (

                                            <div
                                                className="education-card"
                                                key={index}
                                            >

                                                <div className="education-card-header">

                                                    <strong>
                                                        Education {index + 1}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="icon-danger-btn"
                                                        onClick={() =>
                                                            removeEducation(
                                                                index
                                                            )
                                                        }
                                                    >

                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />

                                                    </button>

                                                </div>


                                                <div className="profile-grid">

                                                    <ProfileInput
                                                        label="Degree"
                                                        value={
                                                            education.degree
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "degree",
                                                                value
                                                            )
                                                        }
                                                        placeholder="B.Tech"
                                                    />


                                                    <ProfileInput
                                                        label="Institution"
                                                        value={
                                                            education.institution
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "institution",
                                                                value
                                                            )
                                                        }
                                                        placeholder="University / College"
                                                    />


                                                    <ProfileInput
                                                        label="Field of Study"
                                                        value={
                                                            education.field
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "field",
                                                                value
                                                            )
                                                        }
                                                        placeholder="Computer Science"
                                                    />


                                                    <ProfileInput
                                                        label="Grade / CGPA"
                                                        value={
                                                            education.grade
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "grade",
                                                                value
                                                            )
                                                        }
                                                        placeholder="7.75 CGPA"
                                                    />


                                                    <ProfileInput
                                                        label="Start Year"
                                                        value={
                                                            education.startYear
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "startYear",
                                                                value
                                                            )
                                                        }
                                                        placeholder="2023"
                                                    />


                                                    <ProfileInput
                                                        label="End Year"
                                                        value={
                                                            education.endYear
                                                        }
                                                        onChange={(value) =>
                                                            updateEducation(
                                                                index,
                                                                "endYear",
                                                                value
                                                            )
                                                        }
                                                        placeholder="2027"
                                                    />

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <EmptyState
                                    text="No education added yet."
                                />

                            )}


                            <button
                                type="button"
                                className="profile-outline-btn"
                                onClick={addEducation}
                            >

                                <FontAwesomeIcon
                                    icon={faPlus}
                                />

                                Add Education

                            </button>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        profile.education.length > 0 ? (

                            <div className="education-view-list">

                                {profile.education.map(
                                    (education, index) => (

                                        <div
                                            className="education-view-card"
                                            key={index}
                                        >

                                            <div className="education-view-icon">

                                                <FontAwesomeIcon
                                                    icon={
                                                        faGraduationCap
                                                    }
                                                />

                                            </div>


                                            <div>

                                                <strong>
                                                    {education.degree ||
                                                        "Education"}
                                                </strong>

                                                <span>
                                                    {education.institution ||
                                                        "Institution not added"}
                                                </span>

                                                {education.field && (

                                                    <span>
                                                        {education.field}
                                                    </span>

                                                )}

                                                {(education.startYear ||
                                                    education.endYear) && (

                                                    <small>
                                                        {education.startYear ||
                                                            "—"}
                                                        {" - "}
                                                        {education.endYear ||
                                                            "Present"}
                                                    </small>

                                                )}

                                                {education.grade && (

                                                    <small>
                                                        Grade:{" "}
                                                        {education.grade}
                                                    </small>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                text="No education added yet."
                            />

                        )

                    )}

                </section>


                {/* =========================================
                    ACADEMIC INFORMATION
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faGraduationCap}
                        title="Academic Information"
                        description="College and school academic details."
                        editing={isEditing("academic")}
                        onEdit={() =>
                            startEdit("academic")
                        }
                    />


                    {isEditing("academic") ? (

                        <>

                            <h3 className="profile-subheading">
                                Higher Education
                            </h3>


                            <div className="profile-grid">

                                <ProfileInput
                                    label="University"
                                    value={
                                        draftProfile.academic.university
                                    }
                                    onChange={(value) =>
                                        updateDraftAcademic(
                                            "university",
                                            value
                                        )
                                    }
                                    placeholder="University name"
                                />


                                <ProfileInput
                                    label="Branch / Degree"
                                    value={
                                        draftProfile.academic.branch
                                    }
                                    onChange={(value) =>
                                        updateDraftAcademic(
                                            "branch",
                                            value
                                        )
                                    }
                                    placeholder="Computer Science"
                                />


                                <ProfileInput
                                    label="Graduation Year"
                                    value={
                                        draftProfile.academic
                                            .graduationYear
                                    }
                                    onChange={(value) =>
                                        updateDraftAcademic(
                                            "graduationYear",
                                            value
                                        )
                                    }
                                    placeholder="2027"
                                />


                                <ProfileInput
                                    label="CGPA"
                                    value={
                                        draftProfile.academic.cgpa
                                    }
                                    onChange={(value) =>
                                        updateDraftAcademic(
                                            "cgpa",
                                            value
                                        )
                                    }
                                    placeholder="7.75"
                                />

                            </div>


                            <h3 className="profile-subheading">
                                Class 12
                            </h3>


                            <div className="profile-grid">

                                <ProfileInput
                                    label="Board"
                                    value={
                                        draftProfile.academic
                                            .class12.board
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class12",
                                            "board",
                                            value
                                        )
                                    }
                                    placeholder="CBSE / ISC / State Board"
                                />


                                <ProfileInput
                                    label="School"
                                    value={
                                        draftProfile.academic
                                            .class12.school
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class12",
                                            "school",
                                            value
                                        )
                                    }
                                    placeholder="School name"
                                />


                                <ProfileInput
                                    label="Percentage"
                                    value={
                                        draftProfile.academic
                                            .class12.percentage
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class12",
                                            "percentage",
                                            value
                                        )
                                    }
                                    placeholder="85%"
                                />


                                <ProfileInput
                                    label="Passing Year"
                                    value={
                                        draftProfile.academic
                                            .class12.passingYear
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class12",
                                            "passingYear",
                                            value
                                        )
                                    }
                                    placeholder="2023"
                                />

                            </div>


                            <h3 className="profile-subheading">
                                Class 10
                            </h3>


                            <div className="profile-grid">

                                <ProfileInput
                                    label="Board"
                                    value={
                                        draftProfile.academic
                                            .class10.board
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class10",
                                            "board",
                                            value
                                        )
                                    }
                                    placeholder="CBSE / ISC / State Board"
                                />


                                <ProfileInput
                                    label="School"
                                    value={
                                        draftProfile.academic
                                            .class10.school
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class10",
                                            "school",
                                            value
                                        )
                                    }
                                    placeholder="School name"
                                />


                                <ProfileInput
                                    label="Percentage"
                                    value={
                                        draftProfile.academic
                                            .class10.percentage
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class10",
                                            "percentage",
                                            value
                                        )
                                    }
                                    placeholder="90%"
                                />


                                <ProfileInput
                                    label="Passing Year"
                                    value={
                                        draftProfile.academic
                                            .class10.passingYear
                                    }
                                    onChange={(value) =>
                                        updateDraftClass(
                                            "class10",
                                            "passingYear",
                                            value
                                        )
                                    }
                                    placeholder="2021"
                                />

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        <div className="academic-view">

                            <div className="academic-view-group">

                                <h3>
                                    Higher Education
                                </h3>

                                <div className="profile-view-grid">

                                    <ViewField
                                        label="University"
                                        value={
                                            profile.academic
                                                .university
                                        }
                                    />

                                    <ViewField
                                        label="Branch / Degree"
                                        value={
                                            profile.academic
                                                .branch
                                        }
                                    />

                                    <ViewField
                                        label="Graduation Year"
                                        value={
                                            profile.academic
                                                .graduationYear
                                        }
                                    />

                                    <ViewField
                                        label="CGPA"
                                        value={
                                            profile.academic
                                                .cgpa
                                        }
                                    />

                                </div>

                            </div>


                            <div className="academic-view-group">

                                <h3>
                                    Class 12
                                </h3>

                                <div className="profile-view-grid">

                                    <ViewField
                                        label="Board"
                                        value={
                                            profile.academic
                                                .class12.board
                                        }
                                    />

                                    <ViewField
                                        label="School"
                                        value={
                                            profile.academic
                                                .class12.school
                                        }
                                    />

                                    <ViewField
                                        label="Percentage"
                                        value={
                                            profile.academic
                                                .class12.percentage
                                        }
                                    />

                                    <ViewField
                                        label="Passing Year"
                                        value={
                                            profile.academic
                                                .class12.passingYear
                                        }
                                    />

                                </div>

                            </div>


                            <div className="academic-view-group">

                                <h3>
                                    Class 10
                                </h3>

                                <div className="profile-view-grid">

                                    <ViewField
                                        label="Board"
                                        value={
                                            profile.academic
                                                .class10.board
                                        }
                                    />

                                    <ViewField
                                        label="School"
                                        value={
                                            profile.academic
                                                .class10.school
                                        }
                                    />

                                    <ViewField
                                        label="Percentage"
                                        value={
                                            profile.academic
                                                .class10.percentage
                                        }
                                    />

                                    <ViewField
                                        label="Passing Year"
                                        value={
                                            profile.academic
                                                .class10.passingYear
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    )}

                </section>


                {/* =========================================
                    SOCIAL PROFILES
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faLink}
                        title="Social Profiles"
                        description="Your professional online presence."
                        editing={isEditing("social")}
                        onEdit={() =>
                            startEdit("social")
                        }
                    />


                    {isEditing("social") ? (

                        <>

                            <div className="profile-grid">

                                <ProfileInput
                                    label="LinkedIn"
                                    icon={faLinkedin}
                                    value={
                                        draftProfile.social.linkedin
                                    }
                                    onChange={(value) =>
                                        updateDraftSocial(
                                            "linkedin",
                                            value
                                        )
                                    }
                                    placeholder="https://linkedin.com/in/username"
                                />


                                <ProfileInput
                                    label="GitHub"
                                    icon={faGithub}
                                    value={
                                        draftProfile.social.github
                                    }
                                    onChange={(value) =>
                                        updateDraftSocial(
                                            "github",
                                            value
                                        )
                                    }
                                    placeholder="https://github.com/username"
                                />


                                <ProfileInput
                                    label="Portfolio"
                                    icon={faGlobe}
                                    value={
                                        draftProfile.social.portfolio
                                    }
                                    onChange={(value) =>
                                        updateDraftSocial(
                                            "portfolio",
                                            value
                                        )
                                    }
                                    placeholder="https://yourportfolio.com"
                                />

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        <div className="social-view-grid">

                            <SocialView
                                icon={faLinkedin}
                                label="LinkedIn"
                                value={
                                    profile.social.linkedin
                                }
                            />

                            <SocialView
                                icon={faGithub}
                                label="GitHub"
                                value={
                                    profile.social.github
                                }
                            />

                            <SocialView
                                icon={faGlobe}
                                label="Portfolio"
                                value={
                                    profile.social.portfolio
                                }
                            />

                        </div>

                    )}

                </section>


                {/* =========================================
                    CODING PROFILES
                ========================================= */}

                <section className="profile-section">

                    <SectionHeader
                        icon={faCode}
                        title={
                            <>
                                Coding Profiles

                                <span className="optional-label">
                                    Optional
                                </span>
                            </>
                        }
                        description="LeetCode, Codeforces, CodeChef, HackerRank, GFG, or any platform."
                        editing={isEditing("coding")}
                        onEdit={() =>
                            startEdit("coding")
                        }
                    />


                    {isEditing("coding") ? (

                        <>

                            {draftProfile.codingProfiles.length > 0 && (

                                <div className="coding-profile-list">

                                    {draftProfile.codingProfiles.map(
                                        (
                                            codingProfile,
                                            index
                                        ) => (

                                            <div
                                                className="coding-profile-item"
                                                key={index}
                                            >

                                                <div className="coding-profile-icon">

                                                    <FontAwesomeIcon
                                                        icon={faCode}
                                                    />

                                                </div>


                                                <div className="coding-profile-info">

                                                    <strong>
                                                        {
                                                            codingProfile.name
                                                        }
                                                    </strong>

                                                    <a
                                                        href={
                                                            codingProfile.url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {
                                                            codingProfile.url
                                                        }

                                                        <FontAwesomeIcon
                                                            icon={
                                                                faArrowUpRightFromSquare
                                                            }
                                                        />

                                                    </a>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="icon-danger-btn"
                                                    onClick={() =>
                                                        removeCodingProfile(
                                                            index
                                                        )
                                                    }
                                                >

                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}


                            <div className="coding-profile-add">

                                <div className="profile-field">

                                    <label>
                                        Platform Name
                                    </label>

                                    <input
                                        value={
                                            codingName
                                        }
                                        onChange={(e) =>
                                            setCodingName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. LeetCode"
                                    />

                                </div>


                                <div className="profile-field">

                                    <label>
                                        Profile Link
                                    </label>

                                    <input
                                        value={
                                            codingUrl
                                        }
                                        onChange={(e) =>
                                            setCodingUrl(
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://leetcode.com/username"
                                    />

                                </div>


                                <button
                                    type="button"
                                    className="profile-add-btn coding-add-btn"
                                    onClick={
                                        addCodingProfile
                                    }
                                >

                                    <FontAwesomeIcon
                                        icon={faPlus}
                                    />

                                    Add Profile

                                </button>

                            </div>


                            <EditActions
                                onCancel={cancelEdit}
                                onSave={saveSection}
                                saving={saving}
                            />

                        </>

                    ) : (

                        profile.codingProfiles.length > 0 ? (

                            <div className="coding-profile-list">

                                {profile.codingProfiles.map(
                                    (
                                        codingProfile,
                                        index
                                    ) => (

                                        <div
                                            className="coding-profile-item"
                                            key={index}
                                        >

                                            <div className="coding-profile-icon">

                                                <FontAwesomeIcon
                                                    icon={faCode}
                                                />

                                            </div>


                                            <div className="coding-profile-info">

                                                <strong>
                                                    {
                                                        codingProfile.name
                                                    }
                                                </strong>

                                                <a
                                                    href={
                                                        codingProfile.url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {
                                                        codingProfile.url
                                                    }

                                                    <FontAwesomeIcon
                                                        icon={
                                                            faArrowUpRightFromSquare
                                                        }
                                                    />

                                                </a>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                text="No coding profiles added. This section is optional."
                            />

                        )

                    )}

                </section>

                  </> )}


                {/* =========================================
                    RESUME
                ========================================= */}

                {user.role === "student" && (

                    <section className="profile-section">

                        <div className="profile-section-heading">

    <div className="profile-section-heading-left">

        <div className="profile-section-icon">

            <FontAwesomeIcon
                icon={faFileLines}
            />

        </div>

        <div>

            <h2>
                Resume
            </h2>

            <p>
                Upload your latest resume as a PDF.
            </p>

        </div>

    </div>

</div>


                        {user.resume ? (

                            <div className="resume-profile-card">

                                <div className="resume-profile-icon">

                                    <FontAwesomeIcon
                                        icon={faFileLines}
                                    />

                                </div>


                                <div className="resume-profile-info">

                                    <strong>
                                        Resume uploaded
                                    </strong>

                                    <span>
                                        PDF document
                                    </span>

                                </div>


                                <a
                                    href={`http://localhost:5000/${user.resume}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="resume-view-btn"
                                >
                                    View
                                </a>


                                <button
                                    type="button"
                                    className="resume-delete-btn"
                                    onClick={
                                        deleteResume
                                    }
                                    disabled={saving}
                                >

                                    <FontAwesomeIcon
                                        icon={faTrash}
                                    />

                                </button>

                            </div>

                        ) : (

                            <div className="resume-upload-area">

                                <FontAwesomeIcon
                                    icon={faFileLines}
                                />

                                <div>

                                    <strong>
                                        No resume uploaded
                                    </strong>

                                    <p>
                                        Upload a PDF resume
                                        up to 5MB.
                                    </p>

                                </div>

                            </div>

                        )}


                        <div className="resume-upload-row">

                            <label className="resume-file-label">

                                <FontAwesomeIcon
                                    icon={faUpload}
                                />

                                Choose PDF

                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) =>
                                        setResumeFile(
                                            e.target.files?.[0] ||
                                            null
                                        )
                                    }
                                />

                            </label>


                            {resumeFile && (

                                <span className="selected-file">
                                    {resumeFile.name}
                                </span>

                            )}


                            <button
                                type="button"
                                className="profile-add-btn"
                                disabled={
                                    !resumeFile ||
                                    saving
                                }
                                onClick={
                                    uploadResume
                                }
                            >

                                <FontAwesomeIcon
                                    icon={faUpload}
                                />

                                Upload Resume

                            </button>

                        </div>

                    </section>

                )}


            </div>

        </div>
    );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
    icon,
    title,
    description,
    editing,
    onEdit
}) {

    return (

        <div className="profile-section-heading">

            <div className="profile-section-heading-left">

                <div className="profile-section-icon">

                    <FontAwesomeIcon
                        icon={icon}
                    />

                </div>


                <div>

                    <h2>
                        {title}
                    </h2>

                    <p>
                        {description}
                    </p>

                </div>

            </div>


            {!editing && (

                <button
                    type="button"
                    className="profile-edit-btn"
                    onClick={onEdit}
                >

                    <FontAwesomeIcon
                        icon={faPen}
                    />

                    Edit

                </button>

            )}

        </div>
    );
}


/* =========================================================
   EDIT ACTIONS
========================================================= */

function EditActions({
    onCancel,
    onSave,
    saving
}) {

    return (

        <div className="profile-edit-actions">

            <button
                type="button"
                className="profile-cancel-btn"
                onClick={onCancel}
                disabled={saving}
            >

                <FontAwesomeIcon
                    icon={faBan}
                />

                Cancel

            </button>


            <button
                type="button"
                className="profile-save-section-btn"
                onClick={onSave}
                disabled={saving}
            >

                <FontAwesomeIcon
                    icon={
                        saving
                            ? faFloppyDisk
                            : faCheck
                    }
                />

                {saving
                    ? "Saving..."
                    : "Save Changes"}

            </button>

        </div>
    );
}


/* =========================================================
   EDITABLE INPUT
========================================================= */

function ProfileInput({
    label,
    icon,
    value,
    onChange,
    placeholder,
    type = "text"
}) {

    return (

        <div className="profile-field">

            <label>
                {label}
            </label>


            <div
                className={
                    icon
                        ? "profile-input-icon"
                        : ""
                }
            >

                {icon && (

                    <FontAwesomeIcon
                        icon={icon}
                    />

                )}


                <input
                    type={type}
                    value={value || ""}
                    onChange={(e) =>
                        onChange(
                            e.target.value
                        )
                    }
                    placeholder={
                        placeholder
                    }
                />

            </div>

        </div>
    );
}


/* =========================================================
   VIEW FIELD
========================================================= */

function ViewField({
    label,
    value,
    icon
}) {

    return (

        <div className="profile-view-field">

            <span>
                {label}
            </span>


            <div className="profile-view-value">

                {icon && (

                    <FontAwesomeIcon
                        icon={icon}
                    />

                )}

                <strong>
                    {value ||
                        "Not added yet"}
                </strong>

            </div>

        </div>
    );
}


/* =========================================================
   SOCIAL VIEW
========================================================= */

function SocialView({
    icon,
    label,
    value
}) {

    return (

        <div className="social-view-card">

            <div className="social-view-icon">

                <FontAwesomeIcon
                    icon={icon}
                />

            </div>


            <div>

                <span>
                    {label}
                </span>


                {value ? (

                    <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                    >

                        {value}

                        <FontAwesomeIcon
                            icon={
                                faArrowUpRightFromSquare
                            }
                        />

                    </a>

                ) : (

                    <strong>
                        Not added yet
                    </strong>

                )}

            </div>

        </div>
    );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
    text
}) {

    return (

        <div className="profile-empty-state">

            <FontAwesomeIcon
                icon={faLink}
            />

            <span>
                {text}
            </span>

        </div>
    );
}


export default Profile;