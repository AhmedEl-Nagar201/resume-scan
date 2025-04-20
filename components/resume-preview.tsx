import React from "react"
import type { ResumeData, Link } from "./resume-form"
import { ExternalLink } from "lucide-react"

const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
}

// Component to render links
const LinksList = ({ links }: { links: Link[] }) => {
  if (!links || links.length === 0 || !links.some((link) => link?.name && link?.url)) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3 mt-1">
      {links.map(
        (link, index) =>
          link?.name &&
          link?.url && (
            <a
              key={link.id || index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline text-sm"
            >
              {link.name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          ),
      )}
    </div>
  )
}

const ResumePreview = React.forwardRef<HTMLDivElement, { data: ResumeData }>(({ data }, ref) => {
  // Ensure we have valid data with default values if properties are missing
  const safeData = {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      summary: "",
      links: [],
      ...(data?.personalInfo || {}),
    },
    education: data?.education || [],
    experience: data?.experience || [],
    skills: data?.skills || [],
    languages: data?.languages || [],
    awards: data?.awards || [],
  }

  return (
    <div ref={ref} className="w-full max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header / Personal Info */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{safeData.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-gray-600">
          {safeData.personalInfo.email && <p>{safeData.personalInfo.email}</p>}
          {safeData.personalInfo.phone && <p>{safeData.personalInfo.phone}</p>}
          {safeData.personalInfo.address && <p>{safeData.personalInfo.address}</p>}
        </div>

        {/* Personal Links */}
        <LinksList links={safeData.personalInfo.links} />

        {safeData.personalInfo.summary && (
          <div className="mt-4">
            <p className="text-gray-700">{safeData.personalInfo.summary}</p>
          </div>
        )}
      </div>

      {/* Experience Section */}
      {safeData.experience.some((exp) => exp.company || exp.position) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Professional Experience
          </h2>
          {safeData.experience.map(
            (exp, index) =>
              (exp.company || exp.position) && (
                <div key={exp.id} className="mb-4">
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="text-lg font-semibold text-gray-800">{exp.position}</h3>
                    <p className="text-gray-600 font-medium">{exp.company}</p>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-gray-600 text-sm">
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </p>
                  )}

                  {/* Experience Links */}
                  <LinksList links={exp.links} />

                  {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
                </div>
              ),
          )}
        </div>
      )}

      {/* Education Section */}
      {safeData.education.some((edu) => edu.institution || edu.degree) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Education</h2>
          {safeData.education.map(
            (edu, index) =>
              (edu.institution || edu.degree) && (
                <div key={edu.id} className="mb-4">
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {edu.degree}
                      {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <p className="text-gray-600 font-medium">{edu.institution}</p>
                  </div>
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-gray-600 text-sm">
                      {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                    </p>
                  )}

                  {/* Education Links */}
                  <LinksList links={edu.links} />

                  {edu.description && <p className="mt-2 text-gray-700">{edu.description}</p>}
                </div>
              ),
          )}
        </div>
      )}

      {/* Awards Section */}
      {safeData.awards.some((award) => award.title || award.issuer) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            Awards & Certifications
          </h2>
          {safeData.awards.map(
            (award, index) =>
              (award.title || award.issuer) && (
                <div key={award.id} className="mb-4">
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3 className="text-lg font-semibold text-gray-800">{award.title}</h3>
                    <p className="text-gray-600 font-medium">{award.issuer}</p>
                  </div>
                  {award.date && <p className="text-gray-600 text-sm">{formatDate(award.date)}</p>}

                  {/* Award Links */}
                  <LinksList links={award.links} />

                  {award.description && <p className="mt-2 text-gray-700">{award.description}</p>}
                </div>
              ),
          )}
        </div>
      )}

      {/* Languages Section */}
      {safeData.languages.some((lang) => lang.name) && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {safeData.languages.map(
              (lang, index) =>
                lang.name && (
                  <div key={lang.id} className="flex items-center gap-2">
                    <span className="font-medium">{lang.name}:</span>
                    <span className="text-gray-700">{lang.proficiency}</span>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {safeData.skills.some((skill) => skill.skill) && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {safeData.skills.map(
              (skill, index) =>
                skill.skill && (
                  <span key={skill.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                    {skill.skill}
                  </span>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  )
})

ResumePreview.displayName = "ResumePreview"

export default ResumePreview
