
import React from 'react';

interface BionicTextProps {
  text: string;
}

const BionicText: React.FC<BionicTextProps> = ({ text }) => {
  const words = text.split(/\s+/);
  
  return (
    <>
      {words.map((word, i) => {
        const half = Math.ceil(word.length / 2);
        const start = word.slice(0, half);
        const end = word.slice(half);
        
        return (
          <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
            <span className="font-bold opacity-100">{start}</span>
            <span className="opacity-70">{end}</span>
          </span>
        );
      })}
    </>
  );
};

export default BionicText;
