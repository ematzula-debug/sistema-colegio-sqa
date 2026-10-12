import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { getStoredUser, logoutService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";
import { StudentsPage } from "@/pages/StudentsPage";
import { TeachersPage } from "@/pages/TeachersPage";
import { GuardiansPage } from "@/pages/GuardiansPage";
import { GradesPage } from "@/pages/GradesPage";
import { SectionsPage } from "@/pages/SectionsPage";
import { SubjectsPage } from "@/pages/SubjectsPage";
import { TeacherAssignmentsPage } from "@/pages/TeacherAssignmentsPage";
import { EnrollmentsPage } from "./pages/EnrollmentsPage";
import { NotesPage } from "./pages/NotesPage";
import { RoleRoute } from "./routes/RoleRoute";
import { getDefaultPathByRole } from "@/lib/roles";

function App() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());

  function handleLoginSuccess(userData: AuthUser) {
    setUser(userData);
  }

  function handleLogout() {
    logoutService();
    setUser(null);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={getDefaultPathByRole(user.rol)} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          element={
            <ProtectedRoute user={user}>
              <MainLayout user={user as AuthUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <DashboardPage />
              </RoleRoute>
            }
          />

          <Route
            path="/alumnos"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <StudentsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/profesores"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <TeachersPage />
              </RoleRoute>
            }
          />

          <Route
            path="/encargados"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <GuardiansPage />
              </RoleRoute>
            }
          />

          <Route
            path="/grados"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <GradesPage />
              </RoleRoute>
            }
          />

          <Route
            path="/secciones"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <SectionsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/asignaturas"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <SubjectsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/asignaciones"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <TeacherAssignmentsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/inscripciones"
            element={
              <RoleRoute allowedRoles={["ADMIN", "PROFESOR_DIRECTOR"]}>
                <EnrollmentsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/notas"
            element={
              <RoleRoute
                allowedRoles={[
                  "ADMIN",
                  "PROFESOR_DIRECTOR",
                  "PADRE_ENCARGADO",
                  "ALUMNO",
                ]}
              >
                <NotesPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={user ? getDefaultPathByRole(user.rol) : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


