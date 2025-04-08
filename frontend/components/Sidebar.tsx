"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { signOut } from "next-auth/react"; 
import {
  fetchProjects,
  fetchOrgTeamsByUser,
  fetchDepartments,
} from "../utils/api";
import LoadingBar from "./LoadingBar";
import { type OrgTeam } from "@/context/OrgTeamContext";
import { useProject, type Project } from "@/context/ProjectContext";
import { type Department } from "@/context/DepartmentContext";

interface SidebarLink {
  label: string;
  route: string;
  imgURL: string;
  assigned?: boolean;
}

const Sidebar = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projectLinks, setProjectLinks } = useProject();
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [isDepartmentCoordinator, setisDepartmentCoordinator] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [coordinatorProjectID, setCoordinatorProjectID] = useState("");
  const [coordinatorDepartmentID, setCoordinatorDepartmentID] = useState("");
  const [userDepartmentName, setUserDepartmentName] = useState("");
  const [currentPath, setCurrentPath] = useState(pathname);
  const [currentProjectId, setCurrentProjectId] = useState(
    searchParams?.get("projectID")
  );

  useEffect(() => {
    setCurrentPath(pathname);
    setCurrentProjectId(searchParams?.get("projectID"));
  }, [pathname, searchParams]);

  useEffect(() => {
    const fetchProjectLinks = async () => {
      try {
        if (!user?.id) return;
        const orgTeams = await fetchOrgTeamsByUser(user.id);
        //setOrgTeams(orgTeams);

        // Get all projects at once
        const projects = await fetchProjects();

        // Filter projects based on orgTeams instead of orgTeams state
        const projectIDs = orgTeams.map((team: OrgTeam) => team.projectID._id);
        const userProjects = projects.filter((project: Project) =>
          projectIDs.includes(project._id)
        );

        setProjectLinks(userProjects);
        if (userProjects?.length) setHasProjects(true);
      } catch (error) {
        console.error("Error fetching project links:", error);
      }
    };

    if (user) {
      fetchProjectLinks();
    }
  }, [user, setProjectLinks]);

  useEffect(() => {
    const fetchUserDepartmentName = async (departmentId: string) => {
      try {
        const departments = await fetchDepartments();
        const userDepartment = departments.find(
          (department: Department) => department._id === departmentId
        );
        if (userDepartment) {
          setUserDepartmentName(userDepartment.name);
        }
      } catch (error) {
        console.error("Error fetching department name:", error);
      }
    };

    if (user && user.departmentID) {
      fetchUserDepartmentName(user.departmentID);
    }
  }, [user]);

  useEffect(() => {
    const checkIfCoordinator = async () => {
      try {
        const projects = await fetchProjects();
        const coordinatorProject = projects.find(
          (project: Project) => {
            if(project.coordinatorID==null)
              return false;
            return project.coordinatorID._id === user?.id}
        );
        if (coordinatorProject) {
          setIsCoordinator(true);
          setCoordinatorProjectID(coordinatorProject._id);
        }

        const departments = await fetchDepartments();
        const coordinatorDepartment = departments.find(
          (department: Department) => department.coordinatorID === user?.id
        );
        if (coordinatorDepartment) {
          setisDepartmentCoordinator(true);
          setCoordinatorDepartmentID(coordinatorDepartment._id);
        }
      } catch (error) {
        console.error("Error checking if user is coordinator:", error);
      }
    };

    if (user) {
      checkIfCoordinator();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    signOut({ callbackUrl: "/login" }); 
    //setUser(null);
    router.push("/login");
    setHasProjects(false);
  };

  if (!user) {
    return <LoadingBar />;
  }

  const renderLink = (item: SidebarLink, isActive: boolean) => (
    <Link
      key={item.label}
      href={item.route || "#"}
      className={cn("sidebar-link", isActive && "sidebar-link-active")}
    >
      <div className="relative size-5">
        <Image
          src={item.imgURL}
          alt={item.label}
          fill
          className={cn(
            "object-contain",
            "brightness-0 invert opacity-[.85]",
            isActive && "opacity-100"
          )}
        />
      </div>
      <div className="flex items-center justify-between flex-1">
        <span className="text-sm">{item.label}</span>
        {"assigned" in item && (
          <span
            className={cn(
              "size-2 rounded-full font-medium",
              item.assigned ? "bg-green-500 " : "bg-gray-600 fond-bold"
            )}
          />
        )}
      </div>
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="relative w-14 h-14">
              <Image
                src="/icons/logo-asii.png"
                fill
                alt="ASII logo"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {/* Dashboard Section */}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">Dashboard</h2>
            {renderLink(
              {
                //route: `/home?userDepartmentName=${userDepartmentName}`,
                route: "/home",
                imgURL: "/icons/Home.svg",
                label: "Dashboard",
              },
              pathname === "/home"
            )}
          </div>

          {/* Department Section */}
          {user && (
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">Department Tasks</h2>
              {renderLink(
                {
                  label: userDepartmentName,
                  imgURL: "/icons/project.svg",
                  route: `/department-tasks?department=${user.departmentID}`,
                },
                pathname === `/department-tasks`
              )}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-700 my-2" />

          {/* Projects Section */}
          {hasProjects && (
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">Projects</h2>
              {projectLinks.map((project) => (
                <div key={project._id}>
                  {renderLink(
                    {
                      label: project.name,
                      imgURL: "/icons/project.svg",
                      route: `/tasks?projectID=${project._id}`,
                    },
                    currentPath === `/tasks` && currentProjectId === project._id
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Coordinator Section */}
          {isCoordinator && (
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">Project Coordinator</h2>
              {/*renderLink(
                {
                  label: "Add User to OrgTeam",
                  imgURL: "/icons/UserGroup.svg",
                  route: `/coordinator/add-user?projectID=${coordinatorProjectID}`,
                },
                pathname === `/coordinator/add-user`
              )*/}
              {renderLink(
                {
                  label: "View Project Tasks",
                  imgURL: "/icons/Tasks.svg",
                  route: `/coordinator/tasks?projectID=${coordinatorProjectID}`,
                },
                pathname === `/coordinator/tasks`
              )}
              {renderLink(
                {
                  label: "View Project Team",
                  imgURL: "/icons/UserGroup.svg",
                  route: `/coordinator/project-team?projectID=${coordinatorProjectID}`,
                },
                pathname === "/coordinator/project-team"
              )}
            </div>
          )}
          {isDepartmentCoordinator && (
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">Department Coordinator</h2>
              {renderLink(
                {
                  label: "View Department Tasks",
                  imgURL: "/icons/Tasks.svg",
                  route: `/coordinator/department-tasks?departmentID=${coordinatorDepartmentID}`,
                },
                pathname === `/coordinator/department-tasks`
              )}
              {renderLink(
                {
                  label: "View Department Team",
                  imgURL: "/icons/UserGroup.svg",
                  route: `/coordinator/department-team?departmentID=${coordinatorDepartmentID}`,
                },
                pathname === "/coordinator/department-team"
              )}
            </div>
          )}

          {/* Admin Section */}
          {user.role === "admin" && (
            <div className="sidebar-section">
              <h2 className="sidebar-section-title">Admin</h2>
              {renderLink(
                {
                  label: "Update Coordinator",
                  imgURL: "/icons/ArrowPath.svg",
                  route: "/admin/update-coordinator",
                },
                pathname === "/admin/update-coordinator"
              )}
              {renderLink(
                {
                  label: "Add Department Coordinator",
                  imgURL: "/icons/ArrowPath.svg",
                  route: "/admin/add-department-coordinator",
                },
                pathname === "/admin/add-department-coordinator"
              )}
              {renderLink(
                {
                  label: "Add Project",
                  imgURL: "/icons/project.svg",
                  route: "/admin/add-project",
                },
                pathname === "/admin/add-project"
              )}
              {renderLink(
                {
                  label: "Top Active Members",
                  imgURL: "/icons/ChartBar.svg",
                  route: "/admin/top-members",
                },
                pathname === "/admin/top-members"
              )}
            </div>
          )}
          <div className="sidebar-section">
            <h2 className="sidebar-section-title">Account</h2>
            {renderLink(
              {
                label: "Settings",
                imgURL: "/icons/Settings.svg",
                route: "/account",
              },
              pathname === "/account"
            )}
          </div>
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-email">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout"
            title="Logout"
          >
            <Image
              src="/icons/Logout.svg"
              alt="Logout"
              width={20}
              height={20}
              className="brightness-0 invert opacity-[.85] hover:opacity-100"
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
