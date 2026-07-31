import React from "react";
import { FolderOpen, Plus, Trash2 } from "lucide-react";

const ProjectForm = ({ data = [], onChange }) => {
  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
    };

    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...data];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    onChange(updated);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FolderOpen className="size-5" />
            Projects
          </h3>

          <p className="text-sm text-gray-500">
            Add your personal or professional projects
          </p>
        </div>

        <button
          type="button"
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>


      {/* Projects List */}
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No projects added yet.</p>
          <p className="text-sm">
            Click "Add Project" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {data.map((project, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >

              <div className="flex justify-between items-center">
                <h4 className="font-medium">
                  Project #{index + 1}
                </h4>

                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>


              <input
                type="text"
                placeholder="Project Name"
                value={project.name || ""}
                onChange={(e) =>
                  updateProject(index, "name", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
              />


              <input
                type="text"
                placeholder="Project Type"
                value={project.type || ""}
                onChange={(e) =>
                  updateProject(index, "type", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
              />


              <textarea
                rows={4}
                placeholder="Describe your project..."
                value={project.description || ""}
                onChange={(e) =>
                  updateProject(index, "description", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg resize-none"
              />

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default ProjectForm;