import { createContext, useContext, ReactNode,useState } from 'react';

export interface OrgTeam {
  _id: string;
  userID: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  projectID: {
    _id: string;
    name?: string;
  };
}

interface OrgTeamContextProps {
  orgTeams: OrgTeam[];
  setOrgTeams: (orgTeams: OrgTeam[]) => void;
  addOrgTeam: (orgTeam: OrgTeam) => void;
  removeOrgTeam: (userID: string, projectID: string) => void;
}

const OrgTeamContext = createContext<OrgTeamContextProps | undefined>(undefined);

export const OrgTeamProvider = ({ children }: { children: ReactNode }) => {
  const [orgTeams, setOrgTeams] = useState<OrgTeam[]>([]);

  const addOrgTeam = (orgTeam: OrgTeam) => {
    setOrgTeams(prevOrgTeams => [...prevOrgTeams, orgTeam]);
  };

  const removeOrgTeam = (userID: string, projectID: string) => {
    setOrgTeams(prevOrgTeams => 
      prevOrgTeams.filter(team => 
        !(team.userID._id === userID && team.projectID._id === projectID)
      )
    );
  };

  return (
    <OrgTeamContext.Provider value={{
      orgTeams,
      setOrgTeams,
      addOrgTeam,
      removeOrgTeam
    }}>
      {children}
    </OrgTeamContext.Provider>
  );
};

export const useOrgTeam = () => {
  const context = useContext(OrgTeamContext);
  if (context === undefined) {
    throw new Error('useOrgTeam must be used within an OrgTeamProvider');
  }
  return context;
};

export default OrgTeamContext;