import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { BarChart, type BarDatum } from "@/components/custom-barchart"

import {ChartBarInteractive} from "@/components/chart-bar"

const chartData: BarDatum[] = [
  { label: "Jan", value: 2400, color: "#F59F27" },
  { label: "Feb", value: 1398, color: "#F59F27" },
  { label: "Mar", value: 9800, color: "#F59F27" },
  { label: "Apr", value: 3908, color: "#F59F27" },
  { label: "May", value: 4800, color: "#F59F27" },
  { label: "Jun", value: 3800, color: "#F59F27" },
  { label: "Jul", value: 4300, color: "#F59F27" },
  { label: "Aug", value: 5200, color: "#F59F27" },
  { label: "Sep", value: 3200, color: "#F59F27" },
  { label: "Oct", value: 4100, color: "#F59F27" },
  { label: "Nov", value: 5600, color: "#F59F27" },
  { label: "Dec", value: 6200, color: "#F59F27" },
   { label: "Jan", value: 2400, color: "#F59F27" },
  { label: "Feb", value: 1398, color: "#F59F27" },
  { label: "Mar", value: 9800, color: "#F59F27" },
  { label: "Apr", value: 3908, color: "#F59F27" },
  { label: "May", value: 4800, color: "#F59F27" },
  { label: "Jun", value: 3800, color: "#F59F27" },
  { label: "Jul", value: 4300, color: "#F59F27" },
  { label: "Aug", value: 5200, color: "#F59F27" },
  { label: "Sep", value: 3200, color: "#F59F27" },
  { label: "Oct", value: 4100, color: "#F59F27" },
  { label: "Nov", value: 5600, color: "#F59F27" },
  { label: "Dec", value: 6200, color: "#F59F27" },
  { label: "Jan", value: 2400, color: "#F59F27" },
  { label: "Feb", value: 1398, color: "#F59F27" },
  { label: "Mar", value: 9800, color: "#F59F27" },
  { label: "Apr", value: 3908, color: "#F59F27" },
  { label: "May", value: 4800, color: "#F59F27" },
  { label: "Jun", value: 3800, color: "#F59F27" },
  { label: "Jul", value: 4300, color: "#F59F27" },
  { label: "Aug", value: 5200, color: "#F59F27" },
  { label: "Sep", value: 3200, color: "#F59F27" },
  { label: "Oct", value: 4100, color: "#F59F27" },
  { label: "Nov", value: 5600, color: "#F59F27" },
  { label: "Dec", value: 6200, color: "#F59F27" },
   { label: "Jan", value: 2400, color: "#F59F27" },
  { label: "Feb", value: 1398, color: "#F59F27" },
  { label: "Mar", value: 9800, color: "#F59F27" },
  { label: "Apr", value: 3908, color: "#F59F27" },
  { label: "May", value: 4800, color: "#F59F27" },
  { label: "Jun", value: 3800, color: "#F59F27" },
  { label: "Jul", value: 4300, color: "#F59F27" },
  { label: "Aug", value: 5200, color: "#F59F27" },
  { label: "Sep", value: 3200, color: "#F59F27" },
  { label: "Oct", value: 4100, color: "#F59F27" },
  { label: "Nov", value: 5600, color: "#F59F27" },
  { label: "Dec", value: 6200, color: "#F59F27" },
]

export default function Page() {
  return (
    <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 ">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-7"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full h-175">
            <ChartBarInteractive />
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
        </div>
        </>
  )
}
