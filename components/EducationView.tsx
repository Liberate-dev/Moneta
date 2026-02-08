import React from 'react';

export const EducationView: React.FC = () => {
  const articles = [
    {
      title: "What is Antibiotic Resistance?",
      desc: "It happens when germs like bacteria and fungi develop the ability to defeat the drugs designed to kill them.",
      color: "bg-orange-50 text-orange-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M8.5 15.5v.01"/><path d="M15.5 8.5v.01"/></svg>
    },
    {
      title: "Side Effects to Watch For",
      desc: "Common side effects include nausea and diarrhea. Learn when you should call your doctor immediately.",
      color: "bg-blue-50 text-blue-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    },
    {
      title: "Can I drink alcohol?",
      desc: "Some antibiotics interact negatively with alcohol. It's generally best to avoid it during treatment.",
      color: "bg-purple-50 text-purple-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 21v-8"/><path d="M7 4h10"/><path d="M7 4l2 9h6l2-9"/><path d="M17 13v8"/></svg>
    },
    {
      title: "Missed a dose?",
      desc: "Take it as soon as you remember, unless it's almost time for the next one. Never double up.",
      color: "bg-green-50 text-green-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-sky-500 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/20">
        <h2 className="text-xl font-bold mb-2">Knowledge is Protection</h2>
        <p className="opacity-90 text-sm leading-relaxed">
          Understanding how antibiotics work helps protect you and the community from superbugs.
        </p>
      </div>

      <h3 className="font-bold text-slate-800 text-lg">Learn More</h3>

      <div className="grid gap-4">
        {articles.map((article, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 transition-transform active:scale-[0.98]">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${article.color}`}>
              {article.icon}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">{article.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{article.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-slate-100 rounded-xl text-center">
        <p className="text-xs text-slate-400">Content sourced from WHO and CDC guidelines.</p>
      </div>
    </div>
  );
};