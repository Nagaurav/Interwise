import React from 'react';
import { BookOpen, Youtube, FileText, Code } from 'lucide-react';

interface LearningResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'documentation';
  description: string;
}

interface LearningResourcesProps {
  resources: any; // Can be a Map or plain object from MongoDB
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'video':
      return <Youtube className="w-5 h-5 text-red-500" />;
    case 'article':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'course':
      return <BookOpen className="w-5 h-5 text-purple-500" />;
    case 'documentation':
      return <Code className="w-5 h-5 text-green-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const LearningResources: React.FC<LearningResourcesProps> = ({ resources }) => {
  // Convert resources to a consistent format
  const getResourceEntries = () => {
    try {
      if (!resources) return [];
      
      // Handle case where resources might be a Map
      if (resources instanceof Map) {
        return Array.from(resources.entries());
      }
      
      // Handle case where resources is a plain object
      if (typeof resources === 'object' && resources !== null) {
        return Object.entries(resources);
      }
      
      console.warn('Unexpected resources format:', resources);
      return [];
    } catch (error) {
      console.error('Error processing resources:', error);
      return [];
    }
  };

  const resourceEntries = getResourceEntries();
  const hasResources = resourceEntries.some(([_, items]) => 
    Array.isArray(items) && items.length > 0
  );

  if (!hasResources) {
    console.log('No learning resources to display');
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold text-white">Recommended Learning Resources</h3>
      
      {resourceEntries.map(([topic, resourceList]: [string, any], index: number) => {
        // Ensure resourceList is an array
        const resources = Array.isArray(resourceList) ? resourceList : [];
        if (resources.length === 0) return null;
        
        return (
          <div key={index} className="mb-6">
            <h4 className="mb-3 text-lg font-medium text-blue-300">For: {topic}</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource: any, idx: number) => (
              resource?.url && resource?.title ? (
                <a
                  key={`${index}-${idx}`}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 transition-all duration-200 rounded-lg hover:bg-gray-800/50 bg-gray-900/30 border border-gray-700/50 hover:border-blue-500/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIconForType(resource.type || 'article')}
                    </div>
                    <div>
                      <h5 className="font-medium text-white">{resource.title}</h5>
                      <p className="mt-1 text-sm text-gray-400">
                        {resource.description || 'No description available'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-blue-400">
                        <span className="px-2 py-0.5 bg-blue-900/30 rounded-full">
                          {(resource.type || 'article').charAt(0).toUpperCase() + (resource.type || 'article').slice(1)}
                        </span>
                        <span className="ml-2 text-gray-500 truncate">
                          {(() => {
                            try {
                              return new URL(resource.url).hostname.replace('www.', '');
                            } catch (e) {
                              return 'link';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ) : null
            ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LearningResources;
