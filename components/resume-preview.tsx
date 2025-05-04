import React from "react"
import type { Link } from "./resume-form"
import { ExternalLink } from "lucide-react"
import type { ResumeStyle } from "./resume-style-selector"
import type { PersonalInfo, Education, Experience, Skill, Language, Award } from "./resume-form"
import { cn } from "@/lib/utils"

// Update the interface for ResumePreviewProps
interface ResumePreviewProps {
  data: {
    personalInfo: PersonalInfo
    education: Education[]
    experience: Experience[]
    skills: Skill[]
    languages: Language[]
    awards: Award[]
    resumeStyle?: ResumeStyle
  }
}

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
              style={{ color: "#2563eb" }} // Explicit color for PDF export
            >
              {link.name}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          ),
      )}
    </div>
  )
}

// Map font classes to actual CSS font families for PDF export
const fontFamilyMap: Record<string, string> = {
  "font-sans": "Arial, sans-serif",
  "font-serif": "Times New Roman, serif",
  "font-inter": "Calibri, sans-serif",
  "font-georgia": "Georgia, serif",
  "font-helvetica": "Helvetica, Arial, sans-serif",
}

// Update the ResumePreview component to apply the selected styles
const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
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
    resumeStyle: data?.resumeStyle || { font: "font-sans", layout: "classic", colorScheme: "default" },
  }

  // Get style classes based on the selected style
  const fontClass = safeData.resumeStyle.font || "font-sans"
  const fontFamily = fontFamilyMap[fontClass] || "Arial, sans-serif"

  // Get color classes based on the selected color scheme
  const getColorClasses = () => {
    switch (safeData.resumeStyle.colorScheme) {
      case "gray":
        return {
          heading: "text-gray-800 border-gray-300",
          subheading: "text-gray-700",
          accent: "bg-gray-100 text-gray-800",
          headingColor: "#1f2937",
          subheadingColor: "#374151",
          borderColor: "#d1d5db",
          accentBg: "#f3f4f6",
          accentText: "#1f2937",
        }
      case "green":
        return {
          heading: "text-green-800 border-green-300",
          subheading: "text-green-700",
          accent: "bg-green-100 text-green-800",
          headingColor: "#065f46",
          subheadingColor: "#047857",
          borderColor: "#6ee7b7",
          accentBg: "#d1fae5",
          accentText: "#065f46",
        }
      case "burgundy":
        return {
          heading: "text-red-800 border-red-300",
          subheading: "text-red-700",
          accent: "bg-red-100 text-red-800",
          headingColor: "#991b1b",
          subheadingColor: "#b91c1c",
          borderColor: "#fca5a5",
          accentBg: "#fee2e2",
          accentText: "#991b1b",
        }
      default: // default blue
        return {
          heading: "text-blue-800 border-blue-300",
          subheading: "text-blue-700",
          accent: "bg-blue-100 text-blue-800",
          headingColor: "#1e40af",
          subheadingColor: "#1d4ed8",
          borderColor: "#93c5fd",
          accentBg: "#dbeafe",
          accentText: "#1e40af",
        }
    }
  }

  const colorClasses = getColorClasses()

  // Get layout classes based on the selected layout
  const getLayoutClasses = () => {
    switch (safeData.resumeStyle.layout) {
      case "modern":
        return {
          container: "p-6 shadow-sm",
          header: "pb-4 mb-6 border-b",
          section: "mb-5",
          sectionTitle: "text-xl font-bold mb-3 pb-1 border-b",
          containerPadding: "1.5rem",
          headerPadding: "0 0 1rem 0",
          headerMargin: "0 0 1.5rem 0",
          headerBorder: "1px solid",
          sectionMargin: "0 0 1.25rem 0",
          sectionTitlePadding: "0 0 0.25rem 0",
          sectionTitleMargin: "0 0 0.75rem 0",
          sectionTitleBorder: "1px solid",
        }
      case "professional":
        return {
          container: "p-8 shadow-md",
          header: "pb-6 mb-6 border-b-2",
          section: "mb-6",
          sectionTitle: "text-xl font-bold mb-4 pb-2 border-b",
          containerPadding: "2rem",
          headerPadding: "0 0 1.5rem 0",
          headerMargin: "0 0 1.5rem 0",
          headerBorder: "2px solid",
          sectionMargin: "0 0 1.5rem 0",
          sectionTitlePadding: "0 0 0.5rem 0",
          sectionTitleMargin: "0 0 1rem 0",
          sectionTitleBorder: "1px solid",
        }
      default: // classic
        return {
          container: "p-8 shadow-lg",
          header: "pb-4 mb-6 border-b-2",
          section: "mb-6",
          sectionTitle: "text-xl font-bold mb-3 border-b border-gray-300 pb-1",
          containerPadding: "2rem",
          headerPadding: "0 0 1rem 0",
          headerMargin: "0 0 1.5rem 0",
          headerBorder: "2px solid",
          sectionMargin: "0 0 1.5rem 0",
          sectionTitlePadding: "0 0 0.25rem 0",
          sectionTitleMargin: "0 0 0.75rem 0",
          sectionTitleBorder: "1px solid",
        }
    }
  }

  const layoutClasses = getLayoutClasses()

  return (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-4xl mx-auto bg-white text-black print:shadow-none",
        fontClass,
        layoutClasses.container,
      )}
      style={{
        fontFamily: fontFamily,
        padding: layoutClasses.containerPadding,
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
      data-pdf-exportable="true"
    >
      {/* Header / Personal Info */}
      <div
        className={`${layoutClasses.header} ${colorClasses.heading}`}
        style={{
          padding: layoutClasses.headerPadding,
          margin: layoutClasses.headerMargin,
          borderBottom: `${layoutClasses.headerBorder} ${colorClasses.borderColor}`,
          color: colorClasses.headingColor,
        }}
      >
        <h1 className="text-3xl font-bold" style={{ fontSize: "1.875rem", fontWeight: "700" }}>
          {safeData.personalInfo.fullName || "Your Name"}
        </h1>
        <div
          className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-gray-600"
          style={{ color: "#4b5563", marginTop: "0.5rem" }}
        >
          {safeData.personalInfo.email && <p>{safeData.personalInfo.email}</p>}
          {safeData.personalInfo.phone && <p>{safeData.personalInfo.phone}</p>}
          {safeData.personalInfo.address && <p>{safeData.personalInfo.address}</p>}
        </div>

        {/* Personal Links */}
        <LinksList links={safeData.personalInfo.links} />

        {safeData.personalInfo.summary && (
          <div className="mt-4" style={{ marginTop: "1rem" }}>
            <p className="text-gray-700" style={{ color: "#374151" }}>
              {safeData.personalInfo.summary}
            </p>
          </div>
        )}
      </div>

      {/* Experience Section */}
      {safeData.experience.some((exp) => exp.company || exp.position) && (
        <div className={layoutClasses.section} style={{ margin: layoutClasses.sectionMargin }}>
          <h2
            className={`${layoutClasses.sectionTitle} ${colorClasses.heading}`}
            style={{
              padding: layoutClasses.sectionTitlePadding,
              margin: layoutClasses.sectionTitleMargin,
              borderBottom: `${layoutClasses.sectionTitleBorder} ${colorClasses.borderColor}`,
              color: colorClasses.headingColor,
              fontSize: "1.25rem",
              fontWeight: "700",
            }}
          >
            Professional Experience
          </h2>
          {safeData.experience.map(
            (exp, index) =>
              (exp.company || exp.position) && (
                <div key={exp.id} className="mb-4" style={{ marginBottom: "1rem" }}>
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3
                      className={`text-lg font-semibold ${colorClasses.subheading}`}
                      style={{ fontSize: "1.125rem", fontWeight: "600", color: colorClasses.subheadingColor }}
                    >
                      {exp.position}
                    </h3>
                    <p className="text-gray-600 font-medium" style={{ color: "#4b5563", fontWeight: "500" }}>
                      {exp.company}
                    </p>
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <p className="text-gray-600 text-sm" style={{ color: "#4b5563", fontSize: "0.875rem" }}>
                      {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                    </p>
                  )}

                  {/* Experience Links */}
                  <LinksList links={exp.links} />

                  {exp.description && (
                    <p className="mt-2 text-gray-700" style={{ marginTop: "0.5rem", color: "#374151" }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Education Section */}
      {safeData.education.some((edu) => edu.institution || edu.degree) && (
        <div className={layoutClasses.section} style={{ margin: layoutClasses.sectionMargin }}>
          <h2
            className={`${layoutClasses.sectionTitle} ${colorClasses.heading}`}
            style={{
              padding: layoutClasses.sectionTitlePadding,
              margin: layoutClasses.sectionTitleMargin,
              borderBottom: `${layoutClasses.sectionTitleBorder} ${colorClasses.borderColor}`,
              color: colorClasses.headingColor,
              fontSize: "1.25rem",
              fontWeight: "700",
            }}
          >
            Education
          </h2>
          {safeData.education.map(
            (edu, index) =>
              (edu.institution || edu.degree) && (
                <div key={edu.id} className="mb-4" style={{ marginBottom: "1rem" }}>
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3
                      className={`text-lg font-semibold ${colorClasses.subheading}`}
                      style={{ fontSize: "1.125rem", fontWeight: "600", color: colorClasses.subheadingColor }}
                    >
                      {edu.degree}
                      {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                    </h3>
                    <p className="text-gray-600 font-medium" style={{ color: "#4b5563", fontWeight: "500" }}>
                      {edu.institution}
                    </p>
                  </div>
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-gray-600 text-sm" style={{ color: "#4b5563", fontSize: "0.875rem" }}>
                      {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                    </p>
                  )}

                  {/* Education Links */}
                  <LinksList links={edu.links} />

                  {edu.description && (
                    <p className="mt-2 text-gray-700" style={{ marginTop: "0.5rem", color: "#374151" }}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Awards Section */}
      {safeData.awards.some((award) => award.title || award.issuer) && (
        <div className={layoutClasses.section} style={{ margin: layoutClasses.sectionMargin }}>
          <h2
            className={`${layoutClasses.sectionTitle} ${colorClasses.heading}`}
            style={{
              padding: layoutClasses.sectionTitlePadding,
              margin: layoutClasses.sectionTitleMargin,
              borderBottom: `${layoutClasses.sectionTitleBorder} ${colorClasses.borderColor}`,
              color: colorClasses.headingColor,
              fontSize: "1.25rem",
              fontWeight: "700",
            }}
          >
            Awards & Certifications
          </h2>
          {safeData.awards.map(
            (award, index) =>
              (award.title || award.issuer) && (
                <div key={award.id} className="mb-4" style={{ marginBottom: "1rem" }}>
                  <div className="flex flex-wrap justify-between items-baseline">
                    <h3
                      className={`text-lg font-semibold ${colorClasses.subheading}`}
                      style={{ fontSize: "1.125rem", fontWeight: "600", color: colorClasses.subheadingColor }}
                    >
                      {award.title}
                    </h3>
                    <p className="text-gray-600 font-medium" style={{ color: "#4b5563", fontWeight: "500" }}>
                      {award.issuer}
                    </p>
                  </div>
                  {award.date && (
                    <p className="text-gray-600 text-sm" style={{ color: "#4b5563", fontSize: "0.875rem" }}>
                      {formatDate(award.date)}
                    </p>
                  )}

                  {/* Award Links */}
                  <LinksList links={award.links} />

                  {award.description && (
                    <p className="mt-2 text-gray-700" style={{ marginTop: "0.5rem", color: "#374151" }}>
                      {award.description}
                    </p>
                  )}
                </div>
              ),
          )}
        </div>
      )}

      {/* Languages Section */}
      {safeData.languages.some((lang) => lang.name) && (
        <div className={layoutClasses.section} style={{ margin: layoutClasses.sectionMargin }}>
          <h2
            className={`${layoutClasses.sectionTitle} ${colorClasses.heading}`}
            style={{
              padding: layoutClasses.sectionTitlePadding,
              margin: layoutClasses.sectionTitleMargin,
              borderBottom: `${layoutClasses.sectionTitleBorder} ${colorClasses.borderColor}`,
              color: colorClasses.headingColor,
              fontSize: "1.25rem",
              fontWeight: "700",
            }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-4" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {safeData.languages.map(
              (lang, index) =>
                lang.name && (
                  <div
                    key={lang.id}
                    className="flex items-center gap-2"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span className="font-medium" style={{ fontWeight: "500" }}>
                      {lang.name}:
                    </span>
                    <span className="text-gray-700" style={{ color: "#374151" }}>
                      {lang.proficiency}
                    </span>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {safeData.skills.some((skill) => skill.skill) && (
        <div className={layoutClasses.section} style={{ margin: layoutClasses.sectionMargin }}>
          <h2
            className={`${layoutClasses.sectionTitle} ${colorClasses.heading}`}
            style={{
              padding: layoutClasses.sectionTitlePadding,
              margin: layoutClasses.sectionTitleMargin,
              borderBottom: `${layoutClasses.sectionTitleBorder} ${colorClasses.borderColor}`,
              color: colorClasses.headingColor,
              fontSize: "1.25rem",
              fontWeight: "700",
            }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {safeData.skills.map(
              (skill, index) =>
                skill.skill && (
                  <span
                    key={skill.id}
                    className={`px-3 py-1 rounded-full ${colorClasses.accent}`}
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      backgroundColor: colorClasses.accentBg,
                      color: colorClasses.accentText,
                    }}
                  >
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
