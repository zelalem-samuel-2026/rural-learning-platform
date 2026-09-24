import React from 'react';

interface AmbassadorRequirementsProps {
  requirements?: string[];
}

export const AmbassadorRequirements: React.FC<AmbassadorRequirementsProps> = ({ requirements = [] }) => (
  <div>
    {requirements.map((requirement) => (
      <p key={requirement}>{requirement}</p>
    ))}
  </div>
);
